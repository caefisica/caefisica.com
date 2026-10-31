import params from "@params";

declare global {
  interface Window {
    PagefindUI?: new (options: {
      element: HTMLElement;
      bundlePath: string;
      showImages: boolean;
      showSubResults: boolean;
    }) => unknown;
  }
}

const container = document.getElementById("docsearch");
const stub = container?.querySelector<HTMLInputElement>(".search-stub input");

function mount(element: HTMLElement) {
  const typed = stub?.value ?? "";
  const hadFocus = document.activeElement === stub;
  element.replaceChildren();
  new window.PagefindUI!({
    element,
    bundlePath: params.bundlePath,
    showImages: false,
    showSubResults: false,
  });
  const input = element.querySelector("input");
  if (!input) return;
  // Pagefind gives its input a placeholder but no accessible name.
  input.setAttribute("aria-label", input.placeholder || "Buscar");
  if (typed) {
    input.value = typed;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (hadFocus) input.focus();
}

function load(element: HTMLElement) {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = `${params.bundlePath}pagefind-ui.css`;
  document.head.append(style);

  const script = document.createElement("script");
  script.src = `${params.bundlePath}pagefind-ui.js`;
  script.addEventListener("load", () => {
    if (window.PagefindUI) mount(element);
  });
  script.addEventListener("error", () => {
    element.textContent = "La búsqueda no está disponible.";
  });
  document.head.append(script);
}

if (container) {
  const intents = ["focusin", "pointerenter", "touchstart"] as const;
  const start = () => {
    for (const type of intents) container.removeEventListener(type, start);
    load(container);
  };
  for (const type of intents)
    container.addEventListener(type, start, { passive: true });
  container
    .querySelector("form")
    ?.addEventListener("submit", (event) => event.preventDefault());
  if (container.contains(document.activeElement)) start();
}
