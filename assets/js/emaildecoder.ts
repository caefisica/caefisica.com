function showEmail(event: Event, encodedEmail: string): void {
  event.preventDefault();
  const email = atob(encodedEmail);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email)) {
    window.location.href = "mailto:" + encodeURIComponent(email);
  } else {
    console.error("Email inválido:", email);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll<HTMLAnchorElement>(".email-link").forEach((link) => {
    const encoded = link.getAttribute("data-email");
    if (encoded) {
      link.addEventListener("click", (e) => showEmail(e, encoded));
    }
  });
});
