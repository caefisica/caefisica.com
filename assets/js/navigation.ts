// Los botones data-toggle muestran y ocultan el elemento cuyo id declaran.
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-toggle]",
)) {
  const target = document.getElementById(button.dataset.toggle ?? "");
  if (!target) continue;
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    target.hidden = expanded;
  });
}

// Los menús desplegables son <details>. Se cierran con Escape o al salir de ellos.
const dropdowns = document.querySelectorAll<HTMLDetailsElement>(
  "details[data-dropdown]",
);

document.addEventListener("click", (event) => {
  for (const dropdown of dropdowns) {
    if (dropdown.open && !dropdown.contains(event.target as Node)) {
      dropdown.open = false;
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  for (const dropdown of dropdowns) {
    if (!dropdown.open) continue;
    dropdown.open = false;
    dropdown.querySelector("summary")?.focus();
  }
});

for (const dropdown of dropdowns) {
  dropdown.addEventListener("focusout", (event) => {
    const next = event.relatedTarget as Node | null;
    if (next && !dropdown.contains(next)) dropdown.open = false;
  });
}

// El menú principal es un cajón solo en pantallas angostas.
const menu = document.getElementById("main-menu");
window.matchMedia("(width >= 48rem)").addEventListener("change", (event) => {
  if (event.matches && menu?.matches(":popover-open")) menu.hidePopover();
});
