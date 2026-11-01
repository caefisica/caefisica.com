// The home page's plan panel opens on the cycle the reader chose last.
const KEY = "plan-cycle";
const inputs = document.querySelectorAll<HTMLInputElement>(
  'input[name="ciclo"]',
);

let saved: string | null = null;
try {
  saved = localStorage.getItem(KEY);
} catch {
  // Some private modes block storage. The panel then opens on cycle 1, and a choice is not remembered.
}

for (const input of inputs) {
  if (input.value === saved) input.checked = true;
  input.addEventListener("change", () => {
    try {
      localStorage.setItem(KEY, input.value);
    } catch {}
  });
}
