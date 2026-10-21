(() => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("global-alert-")) {
      document.documentElement.setAttribute("data-global-alert", "closed");
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const announcement = document.getElementById("announcement");
    if (!announcement) return;

    const id = announcement.dataset.id ?? "";

    announcement.classList.toggle(
      "hidden",
      localStorage.getItem(id) === "closed",
    );

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("global-alert-") && key !== id) {
        localStorage.removeItem(key);
        document.documentElement.removeAttribute("data-global-alert");
      }
    });

    announcement
      .querySelector("[data-dismiss]")
      ?.addEventListener("click", () => {
        localStorage.setItem(id, "closed");
        announcement.classList.add("hidden");
      });
  });
})();
