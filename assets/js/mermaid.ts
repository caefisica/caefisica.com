import mermaid from "mermaid";

document.addEventListener("DOMContentLoaded", async () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    look: "classic",
    layout: "dagre",
    fontFamily:
      '"Jost", -apple-system, blinkmacsystemfont, "Segoe UI", roboto, "Helvetica Neue", arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  });
  await mermaid.run({ querySelector: ".mermaid, .language-mermaid" });
});
