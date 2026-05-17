import Clipboard from "clipboard";

for (const pre of Array.from(document.getElementsByTagName("pre"))) {
  pre.insertAdjacentHTML("afterbegin", '<button class="btn btn-copy"></button>');
}

const clipboard = new Clipboard(".btn-copy", {
  target: (trigger) => trigger.nextElementSibling as Element,
});

clipboard.on("success", (e) => {
  e.clearSelection();
});

clipboard.on("error", (e) => {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
});
