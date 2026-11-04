// Shortens long lists to their first items and a button that shows the rest.
// Without this script every item shows. A list inside an article keeps five
// rows, a group on an index keeps fifteen, and a view whose data-more names
// its groups keeps fifteen of them.
const cuts = [
  { lists: ".story-body .rows", items: ":scope > li", keep: 5, min: 8 },
  {
    lists: ".band .rows:not(.story-body .rows)",
    items: ":scope > li",
    keep: 15,
    min: 16,
  },
  { lists: "[data-more]", items: ":scope > .band", keep: 15, min: 16 },
];

const reveals: ((target: Element) => void)[] = [];

function cut(list: HTMLElement, items: string, keep: number, min: number) {
  const all = [...list.querySelectorAll<HTMLElement>(items)];
  if (all.length < min) return;
  const rest = all.slice(keep);
  for (const item of rest) item.hidden = true;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "rows-more";
  button.textContent = ["Mostrar", rest.length, list.dataset.more, "más"]
    .filter(Boolean)
    .join(" ");
  const reveal = () => {
    for (const item of rest) item.hidden = false;
    button.remove();
  };
  button.addEventListener("click", () => {
    reveal();
    rest[0]?.querySelector<HTMLElement>("a")?.focus();
  });
  reveals.push((target) => {
    if (rest.some((item) => item.contains(target))) reveal();
  });
  (list.matches(".rows") ? list : all[all.length - 1]).after(button);
}

for (const { lists, items, keep, min } of cuts)
  for (const list of document.querySelectorAll<HTMLElement>(lists))
    cut(list, items, keep, min);

// A link to an item the cut hid, such as an organization's "Ver en el mapa",
// shows that item.
const follow = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;
  for (const reveal of reveals) reveal(target);
  target.scrollIntoView({ block: "start" });
};
addEventListener("hashchange", follow);
follow();
