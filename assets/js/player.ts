// Plays a lesson in the page's player. Each link opens the lesson on YouTube
// or Drive until this runs, and still does on a modified click.
const player = document.querySelector<HTMLElement>(".player");
const lessons = [
  ...document.querySelectorAll<HTMLAnchorElement>(".lessons a[data-video]"),
];

// Drive's player takes no autoplay or playlist parameters, so a Drive lesson
// waits for a second click on its own play button.
function source(player: HTMLElement, id: string): [string, string] {
  if (player.dataset.host === "drive") {
    return [
      `https://drive.google.com/file/d/${id}/preview`,
      "Reproductor de Google Drive",
    ];
  }
  const params = new URLSearchParams({
    list: player.dataset.playlist ?? "",
    autoplay: "1",
    rel: "0",
  });
  return [
    `https://www.youtube-nocookie.com/embed/${id}?${params}`,
    "Reproductor de YouTube",
  ];
}

function play(id: string): void {
  if (!player) return;
  const frame = document.createElement("iframe");
  [frame.src, frame.title] = source(player, id);
  frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  frame.allowFullscreen = true;
  player.replaceChildren(frame);
  for (const link of lessons) {
    if (link.dataset.video === id) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}

document.addEventListener("click", (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
    return;
  const link = (event.target as Element).closest<HTMLAnchorElement>(
    "a[data-video]",
  );
  if (!link?.dataset.video || !player) return;
  event.preventDefault();
  play(link.dataset.video);
  if (player.getBoundingClientRect().top < 0) {
    player.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
