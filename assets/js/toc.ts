// Marks the contents entry of the section being read: the last heading whose top has passed the line below the sticky header.
const links = [
  ...document.querySelectorAll<HTMLAnchorElement>(
    '#TableOfContents a[href^="#"]',
  ),
];
const targets = links.map((link) =>
  document.getElementById(decodeURIComponent(link.hash.slice(1))),
);
const LINE = 96;

let current: HTMLAnchorElement | undefined;
let queued = false;

function update(): void {
  queued = false;
  let next: HTMLAnchorElement | undefined;
  targets.forEach((target, i) => {
    if (target && target.getBoundingClientRect().top <= LINE) next = links[i];
  });
  // At the bottom of the page the last sections can never reach the line, so the last entry wins.
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
    next = links[links.length - 1];
  }
  if (next === current) return;
  current?.removeAttribute("aria-current");
  next?.setAttribute("aria-current", "location");
  current = next;
}

function queue(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

if (links.length) {
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });
  update();
}
