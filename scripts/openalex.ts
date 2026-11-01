import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CONTENT_DIR = "content/fisicos";
const DATA_DIR = "data/researchers";
const WORKS_API = "https://api.openalex.org/works";
const AUTHORS_API = "https://api.openalex.org/authors";
const SELECTED = 6;

interface Config {
  ids: string[];
  // Large collaborations sign hundreds of papers per member; this keeps the
  // selected list to papers the researcher wrote with a small team.
  maxAuthors: number;
}

interface Work {
  title: string;
  publication_year: number;
  cited_by_count: number;
  doi: string | null;
  authorships: unknown[];
  primary_location: Location | null;
  locations: Location[];
}

interface Location {
  landing_page_url: string | null;
  source: { display_name: string; type: string } | null;
}

// A repository (arXiv, a university archive) hosts a copy; it is not where the work was published.
function venue(work: Work): string {
  const published = work.locations.find((l) =>
    ["journal", "conference", "book series"].includes(l.source?.type ?? ""),
  );
  return published?.source?.display_name ?? "";
}

interface Author {
  works_count: number;
  cited_by_count: number;
}

function readConfig(text: string): Config | undefined {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return undefined;
  const params = Bun.YAML.parse(frontmatter[1]) as { openalex?: Config };
  return params.openalex;
}

async function get<T>(url: URL): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

// OpenAlex needs an API key to page past the first page, so the totals come
// from the author records and the selection from one page of the most cited.
async function fetchTotals(ids: string[]) {
  const authors = await Promise.all(
    ids.map((id) => get<Author>(new URL(`${AUTHORS_API}/${id}`))),
  );
  return {
    works: authors.reduce((sum, a) => sum + a.works_count, 0),
    citations: authors.reduce((sum, a) => sum + a.cited_by_count, 0),
  };
}

async function fetchMostCited(config: Config): Promise<Work[]> {
  const url = new URL(WORKS_API);
  url.searchParams.set(
    "filter",
    `author.id:${config.ids.join("|")},authors_count:<${config.maxAuthors + 1}`,
  );
  url.searchParams.set("sort", "cited_by_count:desc");
  url.searchParams.set("per-page", "50");
  url.searchParams.set(
    "select",
    "title,publication_year,cited_by_count,doi,authorships,primary_location,locations",
  );
  return (await get<{ results: Work[] }>(url)).results;
}

function select(works: Work[]) {
  const seen = new Set<string>();
  return works
    .filter((w) => {
      if (!w.title) return false;
      // A preprint and its journal version are separate works with one title.
      const key = w.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, SELECTED)
    .map((w) => ({
      title: w.title,
      year: w.publication_year,
      venue: venue(w),
      url: w.doi ?? w.primary_location?.landing_page_url ?? "",
      citations: w.cited_by_count,
      authors: w.authorships.length,
    }));
}

await mkdir(DATA_DIR, { recursive: true });
for (const entry of await readdir(CONTENT_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const text = await readFile(
    join(CONTENT_DIR, entry.name, "index.md"),
    "utf8",
  );
  const config = readConfig(text);
  if (!config) continue;
  const data = {
    fetched: new Date().toISOString().slice(0, 10),
    ...(await fetchTotals(config.ids)),
    selected: select(await fetchMostCited(config)),
  };
  await writeFile(
    join(DATA_DIR, `${entry.name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
  console.log(
    `${entry.name}: ${data.works} works, ${data.selected.length} selected`,
  );
}
