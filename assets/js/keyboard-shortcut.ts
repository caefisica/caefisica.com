document.addEventListener("keyup", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "/") {
    document.getElementById("autocomplete-0-input")?.focus();
  }
});
