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
const placeholder = document.getElementById("search-placeholder");

if (container) {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = `${params.bundlePath}pagefind-ui.css`;
  document.head.append(style);

  const script = document.createElement("script");
  script.src = `${params.bundlePath}pagefind-ui.js`;
  script.addEventListener("load", () => {
    placeholder?.remove();
    if (!window.PagefindUI) return;
    new window.PagefindUI({
      element: container,
      bundlePath: params.bundlePath,
      showImages: false,
      showSubResults: false,
    });
  });
  script.addEventListener("error", () => {
    placeholder?.remove();
    container.textContent = "La búsqueda no está disponible.";
  });
  document.head.append(script);
}
