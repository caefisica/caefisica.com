import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const COURSES = "content/unmsm/pregrado/plan-2018/*/playlists.yaml";
const DATA_DIR = "data/playlists";

// The same keys as layouts/_partials/videos/list-id.html, which finds the data a list's page
// reads.
const YOUTUBE_LIST = (url: URL) => url.searchParams.get("list");
const DRIVE_FOLDER = (url: URL) =>
  url.hostname === "drive.google.com"
    ? /^\/drive\/folders\/([\w-]+)/.exec(url.pathname)?.[1]
    : undefined;

interface Lesson {
  id: string;
  title: string;
  duration: number;
  section?: string;
}

interface Data {
  host: "youtube" | "drive";
  title?: string;
  channel?: string;
  description?: string;
  updated?: string;
  lessons: Lesson[];
}

interface Entry {
  id: string;
  title: string;
  duration: number | null;
}

interface Playlist {
  title: string;
  channel: string;
  description: string;
  modified_date: string;
  entries: Entry[];
}

interface Listed {
  url: URL;
  sections: string[];
  skip: Set<string>;
}

async function listed(): Promise<Listed[]> {
  const lists = new Map<string, Listed>();
  for await (const path of new Bun.Glob(COURSES).scan()) {
    const items = Bun.YAML.parse(await Bun.file(path).text()) as {
      url: string;
      sections?: string[];
      skip?: string[];
    }[];
    for (const item of items)
      lists.set(item.url, {
        url: new URL(item.url),
        sections: item.sections ?? [],
        skip: new Set(item.skip ?? []),
      });
  }
  return [...lists.values()];
}

// With --ignore-errors yt-dlp exits non-zero when any one URL fails and still prints the rest.
// A rate limit is not a missing video, so it fails the whole list instead of thinning it.
async function ytDlp(args: string[]): Promise<string> {
  const proc = Bun.spawn(["yt-dlp", ...args], { stderr: "pipe" });
  const [text, errors] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  process.stderr.write(errors);
  const failed = (await proc.exited) !== 0;
  if (errors.includes("HTTP Error 429"))
    throw new Error("rate limited; try again later");
  if (failed && !args.includes("--ignore-errors"))
    throw new Error("yt-dlp failed");
  return text;
}

async function fetchPlaylist(id: string, lang: string): Promise<Playlist> {
  const text = await ytDlp([
    "--flat-playlist",
    "-J",
    "--extractor-args",
    `youtube:lang=${lang}`,
    `https://www.youtube.com/playlist?list=${id}`,
  ]);
  return JSON.parse(text) as Playlist;
}

// YouTube machine-translates some titles into the language a request asks
// for, and has no way to ask for the original. It rarely translates into
// Basque, so a Basque request returns the original, and whichever of the
// English and Spanish titles matches it is kept.
function originalTitles(
  en: Entry[],
  es: Entry[],
  eu: Entry[],
): Map<string, string> {
  const spanish = new Map(es.map((e) => [e.id, e.title]));
  const basque = new Map(eu.map((e) => [e.id, e.title]));
  return new Map(
    en.map((e) => {
      const title = spanish.get(e.id) ?? e.title;
      return [e.id, basque.get(e.id) === title ? title : e.title];
    }),
  );
}

// Unlisted and deleted videos stay in a playlist under placeholder titles
// such as "[Private video]" and no duration.
function playable(e: Entry): e is Entry & { duration: number } {
  return e.duration !== null && !/^\[(private|deleted)/i.test(e.title);
}

async function youtube(id: string): Promise<Data> {
  const playlist = await fetchPlaylist(id, "en");
  const titles = originalTitles(
    playlist.entries,
    (await fetchPlaylist(id, "es")).entries,
    (await fetchPlaylist(id, "eu")).entries,
  );
  return {
    host: "youtube",
    title: playlist.title,
    channel: playlist.channel,
    description: playlist.description.trim(),
    updated: playlist.modified_date.replace(
      /(\d{4})(\d{2})(\d{2})/,
      "$1-$2-$3",
    ),
    lessons: playlist.entries.filter(playable).map((e) => ({
      id: e.id,
      title: tidy(titles.get(e.id) ?? e.title),
      duration: e.duration,
    })),
  };
}

function tidy(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

function decode(text: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
  };
  return text.replace(/&(#x?[\da-f]+|\w+);/gi, (whole, ref: string) => {
    if (ref[0] !== "#") return named[ref] ?? whole;
    return String.fromCodePoint(
      ref[1] === "x" ? parseInt(ref.slice(2), 16) : Number(ref.slice(1)),
    );
  });
}

interface DriveFile {
  id: string;
  name: string;
  path: string[];
}

// Drive's public folder view lists a shared folder without an API key: one entry per file or
// subfolder, each with its id, name and a type icon.
async function driveFolder(id: string, path: string[]): Promise<DriveFile[]> {
  const response = await fetch(
    `https://drive.google.com/embeddedfolderview?id=${id}`,
  );
  if (!response.ok) throw new Error(`Drive folder ${id}: ${response.status}`);
  const html = await response.text();
  const files: DriveFile[] = [];
  for (const entry of html
    .split('<div class="flip-entry" id="entry-')
    .slice(1)) {
    const entryId = entry.slice(0, entry.indexOf('"'));
    const name = decode(/flip-entry-title">([^<]*)/.exec(entry)?.[1] ?? "");
    if (entry.includes("/drive/folders/")) {
      files.push(...(await driveFolder(entryId, [...path, name])));
    } else if (entry.includes("/type/video/")) {
      files.push({ id: entryId, name, path });
    }
  }
  return files;
}

// A lecturer numbers folders and files ("2 - Dinámica", "Clase 10, …") and Drive sorts names
// as text, so they sort by their numbers. The numbers then go: the list numbers its lessons.
const order = new Intl.Collator("es", { numeric: true }).compare;
const drop = {
  folderNumber: /^\d+\s*-\s*/,
  lessonNumber: /^clase\s*\d+\s*[,;:.-]?\s*/i,
  extension: /\.\w{2,4}$/,
  encoding: /\s*\(\d+p_[^)]*\)/,
};

function lessonTitle(name: string): string {
  return tidy(
    name
      .replace(drop.extension, "")
      .replace(drop.encoding, "")
      .replace(drop.lessonNumber, "")
      // Windows file names cannot hold a colon, so lecturers write "_ " for one.
      .replace(/_ /g, ": ")
      .replace(/\.+$/, ""),
  );
}

// A folder's own names may carry no order at all, so playlists.yaml can list its top-level
// folders in teaching order. A folder it does not name goes after those it names.
function byTopic(sections: string[]) {
  const rank = (name: string) => {
    const i = sections.indexOf(name);
    return i < 0 ? sections.length : i;
  };
  return (a: string, b: string) => rank(a) - rank(b) || order(a, b);
}

// A Drive file's length never changes, so a refresh asks yt-dlp only about files the list's
// JSON does not hold yet. Drive answers a burst of lookups with 429.
async function knownDurations(id: string): Promise<Map<string, number>> {
  const file = Bun.file(join(DATA_DIR, `${id}.json`));
  if (!(await file.exists())) return new Map();
  const data = (await file.json()) as Data;
  return new Map(data.lessons.map((l) => [l.id, l.duration]));
}

async function drive(folder: string, sections: string[]): Promise<Data> {
  const top = byTopic(sections);
  const files = (await driveFolder(folder, [])).sort((a, b) => {
    const [x, y] = [
      [...a.path, a.name],
      [...b.path, b.name],
    ];
    if (x.length > 1 && y.length > 1) {
      const step = top(x[0]!, y[0]!);
      if (step) return step;
    }
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      const step = order(x[i]!, y[i]!);
      if (step) return step;
    }
    return x.length - y.length;
  });
  // A file Drive cannot play yet, or one removed since the listing, has no duration.
  const durations = await knownDurations(folder);
  const unknown = files.filter((f) => !durations.has(f.id));
  const lines = unknown.length
    ? await ytDlp([
        "--ignore-errors",
        "-j",
        ...unknown.map((f) => `https://drive.google.com/file/d/${f.id}/view`),
      ])
    : "";
  for (const line of lines.split("\n").filter(Boolean)) {
    const info = JSON.parse(line) as { id: string; duration?: number };
    if (info.duration) durations.set(info.id, Math.round(info.duration));
  }
  return {
    host: "drive",
    lessons: files
      .filter((f) => durations.has(f.id))
      .map((f) => ({
        id: f.id,
        title: lessonTitle(f.name),
        duration: durations.get(f.id)!,
        section:
          f.path
            .map((p) => tidy(p.replace(drop.folderNumber, "")))
            .join(" · ") || undefined,
      })),
  };
}

// `bun run playlists ID…` refreshes only those lists.
const only = new Set(Bun.argv.slice(2));
await mkdir(DATA_DIR, { recursive: true });
for (const { url, sections, skip } of await listed()) {
  const list = YOUTUBE_LIST(url);
  const folder = DRIVE_FOLDER(url);
  const id = list ?? folder;
  if (!id || (only.size > 0 && !only.has(id))) continue;
  let data: Data;
  try {
    data = list ? await youtube(list) : await drive(folder!, sections);
  } catch (error) {
    console.error(`${id}: ${String(error)}`);
    continue;
  }
  data.lessons = data.lessons.filter((l) => !skip.has(l.id));
  await writeFile(
    join(DATA_DIR, `${id}.json`),
    `${JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), ...data }, null, 2)}\n`,
  );
  console.log(`${id}: ${data.lessons.length} lessons`);
}
