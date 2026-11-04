# Deployment

[Español](../es/despliegue.md)

The site is published at `https://web.caefisica.workers.dev/`, the `web` Worker
of the `caefisica` Cloudflare account. It serves the `public/` folder that
`bun run build` generates: `hugo`, then `pagefind`. The host comes from
`baseURL` in [`config/_default/config.toml`](../../config/_default/config.toml);
change it only there.

## Cloudflare

[`wrangler.toml`](../../wrangler.toml) defines the Worker:

- `account_id` is the account that receives the deployment.
- `assets.directory = "./public"` serves the site; missing routes return
  `404.html` (`not_found_handling = "404-page"`).
- `main = "./worker/index.ts"` answers only `/api/*` (`run_worker_first`). Every
  other path is a static file and does not run the script.

## Search log

When a reader closes the search dialog or leaves the page, `search.ts` sends the
last search to `POST /api/search`: the words, the number of results, and the
shorter search shown when nothing matched. The Worker writes them to the
`searches` dataset of Workers Analytics Engine, bound as `SEARCHES`. It stores
no IP, cookie, user agent or page. Analytics Engine keeps the data for three
months.

`bun run searches [days]` prints the most frequent searches of the last 7 days
and those that found nothing. It needs `CLOUDFLARE_ANALYTICS_TOKEN`, a token
with the account permission **Account Analytics: Read**. The deploy token does
not need it.

## Publishing

The `deploy` job of [`ci.yml`](../../.github/workflows/ci.yml) publishes the
site. It needs the `check` job and runs on a push to `master` or when the
workflow is launched by hand on `master`. Its steps:

1. Fails with a message if the `CLOUDFLARE_API_TOKEN` secret is missing.
2. Clones the repository with its full history, because `enableGitInfo` computes
   each page's last-modified date from git.
3. Installs the tools in `mise.toml`.
4. Runs `bun run deploy`. It installs the dependencies in `bun.lock`, builds
   once with `bun run build` and uploads `public/` to Cloudflare
   (`wrangler deploy`).

Deployments queue: a new one waits for the one in progress to finish. When
`deploy` succeeds, the `lighthouse` job audits the Cloudflare site.

### Deploy from scratch

To publish the site with your own accounts:

1. In the Cloudflare dashboard open **Workers & Pages** and copy the **Account
   ID** from _Account Details_. Paste it into `account_id` of `wrangler.toml`.
2. In Cloudflare open **My Profile > API Tokens > Create Token > Custom token**.
   Give it the account permission **Workers Scripts: Edit** on that account.
3. In GitHub open **Settings > Secrets and variables > Actions**. In _Secrets_
   create `CLOUDFLARE_API_TOKEN` with the token.
4. Change `baseURL` in `config/_default/config.toml` and the URLs of
   [`audit_lighthouse.yml`](../../.github/workflows/audit_lighthouse.yml) to the
   host of your Worker.
5. Push to `master` or launch the `checks` workflow from the **Actions** tab.

### Deploy by hand

With the token in the environment, from the repository root:

```bash
export CLOUDFLARE_API_TOKEN=<Cloudflare token>
bun run deploy
```

`bun run deploy` builds before it publishes.

## Search

`bun run build` runs `pagefind --site public` after `hugo`. Pagefind indexes the
content of pages inside the container with the `data-pagefind-body` attribute
([`layouts/baseof.html`](../../layouts/baseof.html)) and writes the index and
its API to `public/pagefind/`.
[`assets/js/search.ts`](../../assets/js/search.ts) queries that API and draws
the results in the dialog of
[`search/dialog.html`](../../layouts/_partials/search/dialog.html). Each page
except the home page carries the `section` metadata with its section path, which
the result shows above the title. Where the search loads:
[architecture](architecture.md).

[`search/keywords.html`](../../layouts/_partials/search/keywords.html) gives a
page the words readers search for that it never says: the front matter
`keywords`, a course's code and its number in digits ("Cálculo 1"), and a
university's acronym. Search weighs them above the title. Those words and a
course's title also go, lowercase and without accents, into the `exact` filter:
a search equal to one of them puts that page first, so "uni" finds the
Universidad Nacional de Ingeniería before every page that says "universidad".

`bun run dev` runs `build` first, so the index also exists locally and search
works.

## Headers and redirects

Hugo generates `public/_headers` and `public/_redirects` from
[`layouts/index.headers`](../../layouts/index.headers) and
[`layouts/index.redirects`](../../layouts/index.redirects). Cloudflare reads
those files.

The `Content-Security-Policy` is built from the lists in
[`data/fixes/headers.yml`](../../data/fixes/headers.yml). `bun run csp` reads
the built pages and fails for each external image, script, frame, media or
stylesheet origin the policy blocks. `bun run check` runs it after the build.
Pagefind needs `'wasm-unsafe-eval'` in `scriptsrc`.

## Tool versions

[`mise.toml`](../../mise.toml) pins the version of each tool. The GitHub
workflows read them from there. Change a version only in `mise.toml`. The
Pagefind version is pinned in `package.json`.

## GitHub workflows

Every workflow can be launched by hand.

| Workflow                 | When                                                              | What it does                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                 | Pull request and push to `master`                                 | `check`: `bun run check`. On `master`, `deploy` publishes the site and then `lighthouse` audits it.                                                                                                                                                                                                                         |
| `check_broken_links.yml` | Pull request and push to `master` that change `content/`; Mondays | Runs `bun run links`: [lychee](https://lychee.cli.rs/) checks the `http` and `https` links of `content/` with [`lychee.toml`](../../lychee.toml). Fails if a link does not respond, and the log names the page and the link. It uses only the workflow's `GITHUB_TOKEN`, with read permission.                              |
| `audit_lighthouse.yml`   | Manual run, or the `lighthouse` job of `ci.yml` after `deploy`    | Lighthouse audit of `https://web.caefisica.workers.dev/` and `/blog/` against the budget in `.github/budget.json`. It measures each URL three times and compares the median of the three runs with the budget; [`.github/lighthouserc.cjs`](../../.github/lighthouserc.cjs) turns the budget into assertions on the median. |
