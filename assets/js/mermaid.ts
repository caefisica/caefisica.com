import mermaid from "mermaid";

document.addEventListener("DOMContentLoaded", async () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    fontFamily:
      '"Jost", -apple-system, blinkmacsystemfont, "Segoe UI", roboto, "Helvetica Neue", arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  });
  await mermaid.run({ querySelector: ".language-mermaid" });
});
