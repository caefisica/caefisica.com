const processForm = (form: HTMLFormElement): void => {
  const data = new FormData(form);
  data.append("form-name", "newsletter");
  fetch("/", { method: "POST", body: data })
    .then(() => {
      form.innerHTML =
        '<p class="form--success mb-0"><strong>¡Casi terminamos</strong>, debería de haberte llegado un correo de bienvenida!</p>';
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      form.innerHTML = `<p class="form--error mb-0">Oops. Algo no salió bien: ${message}</p>`;
    });
};

const emailForm = document.querySelector<HTMLFormElement>(".email-form");
if (emailForm) {
  emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    processForm(emailForm);
  });
}
