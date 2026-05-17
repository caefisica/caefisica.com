function showEmail(event: Event, encodedEmail: string): void {
  event.preventDefault();
  let email: string;
  try {
    email = atob(encodedEmail);
  } catch {
    console.error("Invalid base64 email");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email)) {
    window.location.href = "mailto:" + email;
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
