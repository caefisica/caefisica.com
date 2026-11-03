// Shortens a long list of rows to its first rows and a button that shows the
// rest. Without this script every row shows.
const keep = 5;
const min = keep + 3;

for (const list of document.querySelectorAll<HTMLElement>(
  ".person-page .rows",
)) {
  const rest = [...list.children].slice(keep) as HTMLElement[];
  if (rest.length + keep < min) continue;
  for (const row of rest) row.hidden = true;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "rows-more";
  button.textContent = `Mostrar ${rest.length} más`;
  button.addEventListener("click", () => {
    for (const row of rest) row.hidden = false;
    rest[0]?.querySelector<HTMLElement>("a")?.focus();
    button.remove();
  });
  list.after(button);
}
