(() => {
  Object.keys(localStorage).forEach((key) => {
    if (/^global-alert-/.test(key)) {
      document.documentElement.setAttribute("data-global-alert", "closed");
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const announcement = document.getElementById("announcement");
    if (!announcement) return;

    const id = announcement.dataset.id ?? "";

    if (localStorage.getItem(id) === "closed") {
      announcement.classList.add("d-none");
    } else {
      announcement.classList.remove("d-none");
    }

    Object.keys(localStorage).forEach((key) => {
      if (/^global-alert-/.test(key) && key !== id) {
        localStorage.removeItem(key);
        document.documentElement.removeAttribute("data-global-alert");
      }
    });

    announcement
      .querySelector(".btn-close")
      ?.addEventListener("click", () => localStorage.setItem(id, "closed"));
  });
})();
