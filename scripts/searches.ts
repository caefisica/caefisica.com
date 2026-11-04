// Prints the site searches of the last N days (default 7) as Markdown: the most
// frequent ones and those that found nothing. worker/index.ts writes them to the
// `searches` Analytics Engine dataset. Needs CLOUDFLARE_ANALYTICS_TOKEN, a token
// with the account permission Account Analytics: Read.
//
//   bun run searches [days]

const ACCOUNT = "165a663123262d8ba6c08e92cff7e056";
const LIMIT = 25;

const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN;
if (!token) {
  console.error("Set CLOUDFLARE_ANALYTICS_TOKEN.");
  process.exit(1);
}
const days = Number(process.argv[2] ?? 7);
if (!Number.isInteger(days) || days < 1 || days > 90) {
  console.error("days must be a whole number from 1 to 90.");
  process.exit(1);
}

type Row = Record<string, string | number>;

async function query(sql: string): Promise<Row[]> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/analytics_engine/sql`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: `${sql} FORMAT JSON`,
    },
  );
  if (!response.ok) {
    console.error(`${response.status}: ${await response.text()}`);
    process.exit(1);
  }
  return ((await response.json()) as { data: Row[] }).data;
}

// Analytics Engine samples heavy traffic; _sample_interval is how many searches
// each stored row stands for.
const since = `timestamp > NOW() - INTERVAL '${days}' DAY`;

const [totals] = await query(
  `SELECT SUM(_sample_interval) AS searches, SUM(IF(double1 = 0, _sample_interval, 0)) AS empty FROM searches WHERE ${since}`,
);
const frequent = await query(
  `SELECT blob1 AS query, SUM(_sample_interval) AS times, MAX(double1) AS results FROM searches WHERE ${since} GROUP BY query ORDER BY times DESC LIMIT ${LIMIT}`,
);
const empty = await query(
  `SELECT blob1 AS query, blob2 AS shown, SUM(_sample_interval) AS times FROM searches WHERE ${since} AND double1 = 0 GROUP BY query, shown ORDER BY times DESC LIMIT ${LIMIT}`,
);

function cell(text: string | number): string {
  return String(text).replace(/\|/g, "\\|");
}

export {};

const searches = Number(totals?.searches ?? 0);
const lines = [
  `# Searches, last ${days} days`,
  "",
  `${searches} searches; ${Number(totals?.empty ?? 0)} found nothing.`,
  "",
  "## Most searched",
  "",
  "| Search | Times | Results |",
  "| --- | --: | --: |",
  ...frequent.map((r) => `| ${cell(r.query)} | ${r.times} | ${r.results} |`),
  "",
  "## No results",
  "",
  "The dialog then shows the shorter search in the last column, if any word matched.",
  "",
  "| Search | Times | Shown instead |",
  "| --- | --: | --- |",
  ...empty.map(
    (r) => `| ${cell(r.query)} | ${r.times} | ${cell(r.shown || "—")} |`,
  ),
];
console.log(lines.join("\n"));
