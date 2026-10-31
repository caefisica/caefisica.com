import params from "@params";

type Pagefind = {
  options(options: object): Promise<void>;
  init(): Promise<void>;
  debouncedSearch(
    query: string,
    options?: object,
    timeout?: number,
  ): Promise<{
    results: { data(): Promise<Result> }[];
  } | null>;
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

// The 30 KB engine and its index load on the first sign of intent, not with the page.
function load(): Promise<Pagefind> {
  engine ??= import(`${params.bundlePath}pagefind.js`).then(
    async (pagefind: Pagefind) => {
      await pagefind.options({ excerptLength: 16 });
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

async function search(query: string) {
  if (!query) {
    list.replaceChildren(...suggestions);
    show("Sugerencias", "");
    select(undefined);
    return;
  }
  let found;
  try {
    found = await (await load()).debouncedSearch(query, {}, 120);
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
  const count =
    total > LIMIT
      ? `${LIMIT} de ${total} resultados`
      : `${total} ${total === 1 ? "resultado" : "resultados"}`;
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
