import Clipboard from "clipboard";

document.addEventListener("DOMContentLoaded", () => {
  for (const pre of Array.from(document.getElementsByTagName("pre"))) {
    const btn = document.createElement("button");
    btn.className = "btn btn-copy";
    pre.insertAdjacentElement("afterbegin", btn);
  }

  const clipboard = new Clipboard(".btn-copy", {
    target: (trigger) => trigger.nextElementSibling ?? trigger,
  });

  clipboard.on("success", (e) => {
    e.clearSelection();
  });

  clipboard.on("error", (e) => {
    console.error("Action:", e.action);
    console.error("Trigger:", e.trigger);
  });
});
