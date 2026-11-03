// Fails when a built page loads an external origin its Content-Security-Policy
// blocks. The policy is documented in docs/en/despliegue.md.
import { Glob } from "bun";

const PUBLIC = "public";

const POLICY = (await Bun.file(`${PUBLIC}/_headers`).text())
  .split("\n")
  .find((line) => line.includes("Content-Security-Policy"))!
  .replace(/^\s*Content-Security-Policy:\s*/, "");

const directives = new Map<string, string[]>();
for (const part of POLICY.split(";")) {
  const [name, ...sources] = part.trim().split(/\s+/);
  if (name) directives.set(name, sources);
}

const loads: [string, string, string][] = [
  ["img", "src", "img-src"],
  ["script", "src", "script-src"],
  ["iframe", "src", "frame-src"],
  ["video", "src", "media-src"],
  ["audio", "src", "media-src"],
  ["source", "src", "media-src"],
  ["video", "poster", "img-src"],
  ['link[rel="stylesheet"]', "href", "style-src"],
];

function allows(directive: string, url: URL): boolean {
  const sources = directives.get(directive) ?? directives.get("default-src")!;
  return sources.some((source) => {
    if (!source.startsWith("https://")) return false;
    const host = source.slice("https://".length);
    return host.startsWith("*.")
      ? url.hostname.endsWith(host.slice(1))
      : url.hostname === host;
  });
}

const blocked = new Map<string, Set<string>>();
for await (const file of new Glob("**/*.html").scan(PUBLIC)) {
  const rewriter = new HTMLRewriter();
  for (const [selector, attribute, directive] of loads) {
    rewriter.on(selector, {
      element(el) {
        const value = el.getAttribute(attribute);
        if (!value || !/^https?:\/\//.test(value)) return;
        const url = new URL(value);
        if (url.protocol === "https:" && allows(directive, url)) return;
        const key = `${directive} ${url.origin}`;
        blocked.set(key, (blocked.get(key) ?? new Set()).add(file));
      },
    });
  }
  await rewriter.transform(new Response(Bun.file(`${PUBLIC}/${file}`))).text();
}

for (const [key, files] of blocked) {
  console.error(`${key}: ${files.size} pages, e.g. ${[...files][0]}`);
}
if (blocked.size) {
  console.error("Add each origin to data/fixes/headers.yml.");
  process.exit(1);
}
console.log("Every external origin the pages load passes the CSP.");
