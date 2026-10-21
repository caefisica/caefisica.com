import Clipboard from "clipboard";

for (const pre of Array.from(document.getElementsByTagName("pre"))) {
  const btn = document.createElement("button");
  btn.className = "copy-button";
  btn.type = "button";
  pre.insertAdjacentElement("afterbegin", btn);
}

const clipboard = new Clipboard(".copy-button", {
  target: (trigger) => trigger.nextElementSibling ?? trigger,
});

clipboard.on("success", (e) => {
  e.clearSelection();
});

clipboard.on("error", (e) => {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
});
