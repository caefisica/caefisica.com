// Fails when a built page has a view radio that assets/css/docs.css does not
// show. CSS cannot match a radio value to a view by itself, so docs.css lists
// each value, and a value missing from that list leaves its view blank.
import { Glob } from "bun";

const PUBLIC = "public";
const css = await Bun.file("assets/css/docs.css").text();

const missing = new Map<string, string>();
for await (const file of new Glob("**/*.html").scan(PUBLIC)) {
  await new HTMLRewriter()
    .on('.views input[type="radio"]', {
      element(el) {
        const value = el.getAttribute("value");
        if (!value || missing.has(value)) return;
        const rule = `.views:has([value="${value}"]:checked) > [data-view="${value}"]`;
        if (!css.includes(rule)) missing.set(value, file);
      },
    })
    .transform(new Response(Bun.file(`${PUBLIC}/${file}`)))
    .text();
}

for (const [value, file] of missing) {
  console.error(
    `view "${value}" has no rule in assets/css/docs.css, e.g. ${file}`,
  );
}
if (missing.size) process.exit(1);
console.log("Every view radio has its rule in assets/css/docs.css.");
