import Clipboard from "clipboard";

const icon = (shapes: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes}</svg>`;

const copyIcon = icon(
  '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
);
const checkIcon = icon('<polyline points="20 6 9 17 4 12"></polyline>');

for (const pre of Array.from(document.getElementsByTagName("pre"))) {
  const btn = document.createElement("button");
  btn.className = "copy-button";
  btn.type = "button";
  btn.setAttribute("aria-label", "Copiar el código");
  btn.innerHTML = `<span class="swap block">${copyIcon}${checkIcon}</span>`;
  pre.insertAdjacentElement("afterbegin", btn);
}

// Región viva: lee el aviso a los lectores de pantalla y lo muestra como toast.
const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
document.body.append(toast);

const timers = new Map<Element, number>();
let toastTimer = 0;

function notify(trigger: Element): void {
  const swap = trigger.querySelector(".swap");
  swap?.setAttribute("data-on", "");
  clearTimeout(timers.get(trigger));
  timers.set(
    trigger,
    window.setTimeout(() => swap?.removeAttribute("data-on"), 2000),
  );

  toast.textContent = "Código copiado";
  toast.classList.add("is-open");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-open");
    // Vacía el aviso cuando termina la salida para que no quede en el árbol de accesibilidad.
    toastTimer = window.setTimeout(() => (toast.textContent = ""), 400);
  }, 2000);
}

const clipboard = new Clipboard(".copy-button", {
  target: (trigger) => trigger.nextElementSibling ?? trigger,
});

clipboard.on("success", (e) => {
  e.clearSelection();
  notify(e.trigger);
});

clipboard.on("error", (e) => {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
});
