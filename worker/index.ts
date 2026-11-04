// The site is static assets; this script answers only the /api/* paths that
// wrangler.toml routes to it first.

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SEARCHES: {
    writeDataPoint(point: { blobs?: string[]; doubles?: number[] }): void;
  };
};

// A reader's query is a few words. The cap stops a scripted post from storing a page of text.
const MAX_QUERY = 100;

type Search = {
  query: string;
  results: number;
  shown: string;
  relaxed: number;
};

function parse(body: unknown): Search | undefined {
  if (typeof body !== "object" || body === null) return;
  const { query, results, shown, relaxed } = body as Record<string, unknown>;
  if (typeof query !== "string" || typeof results !== "number") return;
  const q = query.trim().toLowerCase().slice(0, MAX_QUERY);
  if (!q) return;
  return {
    query: q,
    results: Math.max(0, Math.floor(results)),
    shown:
      typeof shown === "string"
        ? shown.trim().toLowerCase().slice(0, MAX_QUERY)
        : "",
    relaxed: typeof relaxed === "number" ? Math.max(0, Math.floor(relaxed)) : 0,
  };
}

// Stores the words and the counts only: no IP, cookie, user agent or page.
async function logSearch(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  // A beacon from the site's own pages; anything else is not a reader's search.
  if (request.headers.get("sec-fetch-site") !== "same-origin")
    return new Response(null, { status: 403 });
  const search = parse(await request.json().catch(() => undefined));
  if (!search) return new Response(null, { status: 400 });
  env.SEARCHES.writeDataPoint({
    blobs: [search.query, search.shown],
    doubles: [search.results, search.relaxed],
  });
  return new Response(null, { status: 204 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/search") return logSearch(request, env);
    if (pathname.startsWith("/api/"))
      return new Response(null, { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
