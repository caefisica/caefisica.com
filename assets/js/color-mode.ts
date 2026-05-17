const getPreferredTheme = (): string =>
  localStorage.getItem("theme") ??
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const setTheme = (theme: string): void => {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-dark-mode", "");
  } else {
    document.documentElement.removeAttribute("data-dark-mode");
  }
  localStorage.setItem("theme", theme);
};

const toggleTheme = (): void => {
  const current = document.documentElement.hasAttribute("data-dark-mode") ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
};

const initTheme = (): void => {
  setTheme(getPreferredTheme());

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => setTheme(e.matches ? "dark" : "light"));

  document.getElementById("mode")?.addEventListener("click", toggleTheme);
  document
    .querySelectorAll("[data-theme-toggle]")
    .forEach((el) => el.addEventListener("click", toggleTheme));
};

document.addEventListener("DOMContentLoaded", initTheme);
