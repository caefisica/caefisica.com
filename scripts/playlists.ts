import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const COURSES = "content/unmsm/pregrado/plan-2018/*/playlists.yaml";
const DATA_DIR = "data/playlists";

interface Entry {
  id: string;
  title: string;
  duration: number | null;
  availability: string | null;
}

interface Playlist {
  title: string;
  channel: string;
  description: string;
  modified_date: string;
  entries: Entry[];
}

// Unlisted and deleted videos stay in a playlist under placeholder titles
// such as "[Private video]" and no duration.
function playable(e: Entry): boolean {
  return e.duration !== null && !/^\[(private|deleted)/i.test(e.title);
}

function listId(url: string): string | undefined {
  return new URL(url).searchParams.get("list") ?? undefined;
}

async function playlistIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  for await (const path of new Bun.Glob(COURSES).scan()) {
    const items = Bun.YAML.parse(await Bun.file(path).text()) as {
      url: string;
    }[];
    for (const item of items) {
      const id = listId(item.url);
      if (id) ids.add(id);
    }
  }
  return ids;
}

async function fetchPlaylist(id: string, lang: string): Promise<Playlist> {
  const proc = Bun.spawn(
    [
      "yt-dlp",
      "--flat-playlist",
      "-J",
      "--extractor-args",
      `youtube:lang=${lang}`,
      `https://www.youtube.com/playlist?list=${id}`,
    ],
    { stderr: "inherit" },
  );
  const text = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) throw new Error(`yt-dlp failed for ${id}`);
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

await mkdir(DATA_DIR, { recursive: true });
for (const id of await playlistIds()) {
  let playlist: Playlist;
  let titles: Map<string, string>;
  try {
    playlist = await fetchPlaylist(id, "en");
    titles = originalTitles(
      playlist.entries,
      (await fetchPlaylist(id, "es")).entries,
      (await fetchPlaylist(id, "eu")).entries,
    );
  } catch (error) {
    console.error(String(error));
    continue;
  }
  const lessons = playlist.entries.filter(playable).map((e) => ({
    id: e.id,
    title: (titles.get(e.id) ?? e.title).replace(/\s+/g, " ").trim(),
    duration: e.duration,
  }));
  const data = {
    fetched: new Date().toISOString().slice(0, 10),
    title: playlist.title,
    channel: playlist.channel,
    description: playlist.description.trim(),
    updated: playlist.modified_date.replace(
      /(\d{4})(\d{2})(\d{2})/,
      "$1-$2-$3",
    ),
    lessons,
  };
  await writeFile(
    join(DATA_DIR, `${id}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
  console.log(`${id}: ${lessons.length} lessons`);
}
