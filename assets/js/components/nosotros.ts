document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector<HTMLElement>("[data-sidebar]");
  const sidebarBtn = document.querySelector<HTMLButtonElement>("[data-sidebar-btn]");
  const modalContainer = document.querySelector<HTMLElement>("[data-modal-container]");
  const modalCloseBtn = document.querySelector<HTMLButtonElement>("[data-modal-close-btn]");
  const overlay = document.querySelector<HTMLElement>("[data-overlay]");
  const modalImg = document.querySelector<HTMLImageElement>("[data-modal-img]");
  const modalTitle = document.querySelector<HTMLElement>("[data-modal-title]");
  const modalText = document.querySelector<HTMLElement>("[data-modal-text]");

  if (!sidebar || !sidebarBtn || !modalContainer || !modalCloseBtn || !overlay) return;

  sidebarBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

  const toggleModal = (): void => {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  document.querySelectorAll("[data-testimonials-item]").forEach((item) => {
    item.addEventListener("click", () => {
      const avatar = item.querySelector<HTMLImageElement>("[data-testimonials-avatar]");
      const title = item.querySelector<HTMLElement>("[data-testimonials-title]");
      const text = item.querySelector<HTMLElement>("[data-testimonials-text]");

      if (modalImg && avatar) {
        modalImg.src = avatar.src;
        modalImg.alt = avatar.alt;
      }
      if (modalTitle && title) modalTitle.innerHTML = title.innerHTML;
      if (modalText && text) modalText.innerHTML = text.innerHTML;

      toggleModal();
    });
  });

  modalCloseBtn.addEventListener("click", toggleModal);
  overlay.addEventListener("click", toggleModal);

  // Filter / select
  const select = document.querySelector<HTMLButtonElement>("[data-select]");
  const selectItems = document.querySelectorAll<HTMLButtonElement>("[data-select-item]");
  // Note: "selecct" is a typo preserved from the HTML template attribute
  const selectValue = document.querySelector<HTMLElement>("[data-selecct-value]");
  const filterBtns = document.querySelectorAll<HTMLButtonElement>("[data-filter-btn]");
  const filterItems = document.querySelectorAll<HTMLElement>("[data-filter-item]");

  const filterFunc = (selected: string): void => {
    filterItems.forEach((item) => {
      const matches = selected === "todo" || selected === item.dataset.category;
      item.classList.toggle("active", matches);
    });
  };

  select?.addEventListener("click", () => select.classList.toggle("active"));

  selectItems.forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = item.innerText;
      select?.classList.toggle("active");
      filterFunc(value);
    });
  });

  let lastActiveBtn = filterBtns[0] ?? null;
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = btn.innerText;
      filterFunc(value);
      lastActiveBtn?.classList.remove("active");
      btn.classList.add("active");
      lastActiveBtn = btn;
    });
  });

  // Contact form (optional — may not be present in all templates)
  const form = document.querySelector<HTMLFormElement>("[data-form]");
  const formBtn = document.querySelector<HTMLButtonElement>("[data-form-btn]");
  if (form && formBtn) {
    document.querySelectorAll<HTMLInputElement>("[data-form-input]").forEach((input) => {
      input.addEventListener("input", () => {
        formBtn.disabled = !form.checkValidity();
      });
    });
  }

  // Page navigation
  const navLinks = document.querySelectorAll<HTMLButtonElement>("[data-nav-link]");
  const pages = document.querySelectorAll<HTMLElement>("[data-page]");

  navLinks.forEach((link, i) => {
    link.addEventListener("click", () => {
      pages.forEach((page, j) => {
        const isTarget = link.innerHTML.toLowerCase() === page.dataset.page;
        page.classList.toggle("active", isTarget);
        navLinks[j]?.classList.toggle("active", isTarget);
      });
      navLinks[i]?.classList.add("active");
      window.scrollTo(0, 0);
    });
  });
});
