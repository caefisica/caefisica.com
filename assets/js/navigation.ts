// Los botones data-toggle despliegan el .disclosure cuyo id declaran. El CSS anima la altura con
// data-open; `inert` saca el contenido plegado del orden de tabulación y del árbol de accesibilidad.
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-toggle]",
)) {
  const target = document.getElementById(button.dataset.toggle ?? "");
  if (!target) continue;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    target.dataset.open = String(open);
    target.inert = !open;
  });
}

// Los menús desplegables son <details>. Se cierran con Escape o al salir de ellos.
const dropdowns = document.querySelectorAll<HTMLDetailsElement>(
  "details[data-dropdown]",
);

// `is-closing` reproduce la animación de salida antes de cerrar el <details>.
// Con movimiento reducido no hay animaciones y se cierra al instante.
async function closeDropdown(dropdown: HTMLDetailsElement): Promise<void> {
  if (!dropdown.open || dropdown.classList.contains("is-closing")) return;
  dropdown.classList.add("is-closing");
  const animations = dropdown.querySelector("ul")?.getAnimations() ?? [];
  await Promise.all(animations.map((a) => a.finished.catch(() => undefined)));
  dropdown.open = false;
  dropdown.classList.remove("is-closing");
}

document.addEventListener("click", (event) => {
  for (const dropdown of dropdowns) {
    if (!dropdown.contains(event.target as Node)) void closeDropdown(dropdown);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  for (const dropdown of dropdowns) {
    if (!dropdown.open) continue;
    void closeDropdown(dropdown);
    dropdown.querySelector("summary")?.focus();
  }
});

for (const dropdown of dropdowns) {
  dropdown.addEventListener("focusout", (event) => {
    const next = event.relatedTarget as Node | null;
    if (next && !dropdown.contains(next)) void closeDropdown(dropdown);
  });
  dropdown.querySelector("summary")?.addEventListener("click", (event) => {
    if (!dropdown.open) return;
    event.preventDefault();
    void closeDropdown(dropdown);
  });
}

// El menú principal es un cajón solo en pantallas angostas.
const menu = document.getElementById("main-menu");
window.matchMedia("(width >= 48rem)").addEventListener("change", (event) => {
  if (event.matches && menu?.matches(":popover-open")) menu.hidePopover();
});
