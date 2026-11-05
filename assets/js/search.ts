import params from "@params";

type Found = { results: { id: string; data(): Promise<Result> }[] };

type Pagefind = {
  options(options: object): Promise<void>;
  init(): Promise<void>;
  search(query: string | null, options?: object): Promise<Found>;
  debouncedSearch(
    query: string,
    options?: object,
    timeout?: number,
  ): Promise<Found | null>;
};

type Result = {
  url: string;
  excerpt: string;
  meta: { title?: string; section?: string };
};

const LIMIT = 10;

const dialog = document.getElementById("search") as HTMLDialogElement | null;
const input = document.getElementById("search-input") as HTMLInputElement;
const list = document.getElementById("search-results") as HTMLElement;
const label = document.getElementById("search-label") as HTMLElement;
const status = document.getElementById("search-status") as HTMLElement;
const suggestions = list ? [...list.children] : [];
const enterIcon = list?.querySelector("svg")?.outerHTML ?? "";

let engine: Promise<Pagefind> | undefined;

type Searched = {
  query: string;
  results: number;
  shown: string;
  relaxed: number;
};

let settled: Searched | undefined;

function report() {
  if (!settled) return;
  navigator.sendBeacon(
    "/api/search",
    new Blob([JSON.stringify(settled)], { type: "application/json" }),
  );
  settled = undefined;
}

function load(): Promise<Pagefind> {
  vocabularyWords().catch(() => (vocabulary = undefined));
  engine ??= import(`${params.bundlePath}pagefind.js`).then(
    async (pagefind: Pagefind) => {
      await pagefind.options({
        excerptLength: 16,
        ranking: { metaWeights: { keywords: 10 }, pageLength: 0.2 },
      });
      await pagefind.init();
      return pagefind;
    },
  );
  return engine;
}

function options(): HTMLAnchorElement[] {
  return [...list.querySelectorAll<HTMLAnchorElement>("[role=option]")];
}

function select(option: HTMLAnchorElement | undefined) {
  for (const o of options())
    o.setAttribute("aria-selected", String(o === option));
  if (option) {
    option.id ||= `search-option-${options().indexOf(option)}`;
    input.setAttribute("aria-activedescendant", option.id);
    option.scrollIntoView({ block: "nearest" });
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function move(step: number) {
  const all = options();
  if (!all.length) return;
  const current = all.findIndex(
    (o) => o.getAttribute("aria-selected") === "true",
  );
  select(all[(current + step + all.length) % all.length]);
}

const entities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escape(text: string): string {
  return text.replace(/[&<>"]/g, (c) => entities[c]);
}

function render(result: Result, index: number): string {
  const trail = result.meta.section
    ? `<span class="search-trail">${escape(result.meta.section)}</span>`
    : "";
  // Pagefind escapes the excerpt and wraps each match in <mark>.
  return `<a class="search-option" role="option" id="search-option-${index}" href="${escape(result.url)}" aria-selected="false">${trail}<span class="search-title">${escape(result.meta.title ?? result.url)}</span><span class="search-excerpt">${result.excerpt}</span>${enterIcon}</a>`;
}

function show(heading: string, announce: string) {
  label.textContent = heading;
  label.hidden = !heading;
  status.textContent = announce;
}

function message(html: string) {
  list.innerHTML = `<p class="search-empty">${html}</p>`;
  select(undefined);
}

type Retried = { query: string; found: Found; how: "corrected" | "relaxed" };

async function relax(
  pagefind: Pagefind,
  query: string,
): Promise<Retried | undefined> {
  const words = query.split(/\s+/);
  if (words.length < 2) return;
  const alone = await Promise.all(words.map((w) => pagefind.search(w)));
  const hits = new Map(words.map((w, i) => [w, alone[i].results.length]));
  const kept = words.filter((w) => hits.get(w));
  while (kept.length) {
    const shorter = kept.join(" ");
    const found = await pagefind.search(shorter);
    if (found.results.length) return { query: shorter, found, how: "relaxed" };
    const rarest = kept.reduce((a, b) => (hits.get(b)! < hits.get(a)! ? b : a));
    kept.splice(kept.indexOf(rarest), 1);
  }
}

// The same form layouts/_partials/search/fold.html gives a page's exact names.
function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

type Word = { word: string; folded: string };

let vocabulary: Promise<Word[]> | undefined;

function vocabularyWords(): Promise<Word[]> {
  vocabulary ??= fetch("/search-words.json")
    .then((response) => response.json())
    .then((words: string[]) =>
      words.map((word) => ({ word, folded: fold(word) })),
    );
  return vocabulary;
}

// Returns max + 1 once the distance must exceed max.
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      let d = Math.min(
        previous[j] + 1,
        row[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d = Math.min(d, before[j - 2] + 1);
      row.push(d);
    }
    if (Math.min(...row) > max) return max + 1;
    before = previous;
    previous = row;
  }
  return previous[b.length];
}

async function known(pagefind: Pagefind, typed: string): Promise<boolean> {
  const folded = fold(typed);
  if (folded.length < 4) return true;
  const starts = (w: string) => fold(w).startsWith(folded);
  if ((await vocabularyWords()).some((w) => w.folded.startsWith(folded)))
    return true;
  const [best] = (await pagefind.search(typed)).results;
  if (!best) return false;
  const { excerpt } = await best.data();
  return [...excerpt.matchAll(/<mark>(.*?)<\/mark>/g)].some((m) =>
    starts(m[1]),
  );
}

function closest(typed: string, words: Word[]): string | undefined {
  const folded = fold(typed);
  let best: string | undefined;
  let least = folded.length <= 5 ? 2 : 3;
  for (const { word, folded: other } of words) {
    const d = distance(folded, other, least - 1);
    if (d > 0 && d < least) {
      best = word;
      least = d;
    }
  }
  return best;
}

async function correct(
  pagefind: Pagefind,
  query: string,
): Promise<Retried | undefined> {
  const fixed = await Promise.all(
    query
      .split(/\s+/)
      .map(async (w) =>
        (await known(pagefind, w))
          ? w
          : (closest(w, await vocabularyWords()) ?? w),
      ),
  );
  const corrected = fixed.join(" ");
  if (corrected === query) return;
  const found = await pin(
    pagefind,
    corrected,
    await pagefind.search(corrected),
  );
  if (found.results.length)
    return { query: corrected, found, how: "corrected" };
}

// A filter searched without a query makes Pagefind fetch every index chunk.
async function pin(
  pagefind: Pagefind,
  query: string,
  found: Found,
): Promise<Found> {
  const exact = await pagefind.search(query, {
    filters: { exact: fold(query) },
  });
  if (!exact.results.length) return found;
  const first = new Set(exact.results.map((r) => r.id));
  return {
    results: [
      ...exact.results,
      ...found.results.filter((r) => !first.has(r.id)),
    ],
  };
}

async function search(query: string) {
  settled = undefined;
  if (!query) {
    list.replaceChildren(...suggestions);
    show("Sugerencias", "");
    select(undefined);
    return;
  }
  let found;
  let shown = query;
  let how: Retried["how"] | undefined;
  try {
    const pagefind = await load();
    found = await pagefind.debouncedSearch(query, {}, 120);
    if (found) found = await pin(pagefind, query, found);
    if (found && input.value.trim() === query) {
      const retried =
        (await correct(pagefind, query)) ??
        (found.results.length ? undefined : await relax(pagefind, query));
      if (retried) ({ query: shown, found, how } = retried);
    }
  } catch {
    message(
      "La búsqueda no está disponible. Revisa tu conexión y vuelve a intentarlo.",
    );
    show("", "La búsqueda no está disponible.");
    return;
  }
  // null: a later keystroke superseded this search.
  if (!found || input.value.trim() !== query) return;
  const total = found.results.length;
  const relaxed = shown !== query;
  settled = {
    query,
    results: relaxed ? 0 : total,
    shown: relaxed ? shown : "",
    relaxed: relaxed ? total : 0,
  };
  if (!total) {
    message(
      `Sin resultados para <strong>«${escape(query)}»</strong>.<br>Prueba con el nombre o el código del curso.`,
    );
    show("", `Sin resultados para ${query}.`);
    return;
  }
  const data = await Promise.all(
    found.results.slice(0, LIMIT).map((r) => r.data()),
  );
  if (input.value.trim() !== query) return;
  list.innerHTML = data.map(render).join("");
  let count =
    total > LIMIT
      ? `${LIMIT} de ${total} resultados`
      : `${total} ${total === 1 ? "resultado" : "resultados"}`;
  if (how === "corrected") count = `¿Quisiste decir «${shown}»? · ${count}`;
  else if (how === "relaxed")
    count = `Sin resultados para «${query}» · ${count} para «${shown}»`;
  show(count, count);
  select(options()[0]);
}

function open() {
  if (!dialog || dialog.open) return;
  load().catch(() => {});
  dialog.showModal();
  input.select();
}

function editable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      /^(input|textarea|select)$/i.test(target.tagName))
  );
}

if (dialog) {
  const mac = /mac|iphone|ipad/i.test(navigator.platform);
  for (const key of document.querySelectorAll("[data-kbd-mod]")) {
    key.textContent = mac ? "⌘" : "Ctrl";
  }

  for (const trigger of document.querySelectorAll("[data-search-open]")) {
    trigger.addEventListener("click", open);
    trigger.addEventListener("pointerenter", () => load().catch(() => {}), {
      once: true,
    });
  }

  for (const close of dialog.querySelectorAll("[data-search-close]")) {
    close.addEventListener("click", () => dialog.close());
  }

  // A click on the backdrop lands on the dialog itself; the panel covers every other point of it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  input.addEventListener("input", () => search(input.value.trim()));

  // Choosing a result navigates away, which hides the page.
  dialog.addEventListener("close", report);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") report();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const active = list.querySelector<HTMLAnchorElement>(
        "[aria-selected=true]",
      );
      if (!active) return;
      if (event.metaKey || event.ctrlKey)
        window.open(active.href, "_blank", "noopener");
      else active.click();
    } else if (event.key === "Escape") {
      // A search field spends the first Escape on clearing itself; the footer promises that Escape closes.
      event.preventDefault();
      dialog.close();
    }
  });

  list.addEventListener("pointermove", (event) => {
    const option = (event.target as Element).closest<HTMLAnchorElement>(
      "[role=option]",
    );
    if (option && option.getAttribute("aria-selected") !== "true")
      select(option);
  });

  document.addEventListener("keydown", (event) => {
    const shortcut =
      event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
    const slash =
      event.key === "/" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !editable(event.target);
    if (shortcut || slash) {
      event.preventDefault();
      if (dialog.open) input.select();
      else open();
    }
  });
}
