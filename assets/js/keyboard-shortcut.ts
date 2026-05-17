document.addEventListener("keyup", (e: KeyboardEvent) => {
  const tag = (document.activeElement?.tagName ?? "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if ((e.ctrlKey || e.metaKey) && e.key === "/") {
    document.getElementById("autocomplete-0-input")?.focus();
  }
});
