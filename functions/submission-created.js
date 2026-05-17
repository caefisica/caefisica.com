const { SENDGRID_API_KEY, ADMIN_EMAIL, NOTIFICATION_EMAIL, SENDGRID_LIST_ID } = process.env;

export const handler = async (event) => {
  try {
    if (!event.body) return { statusCode: 400, body: "Missing body" };
    if (!SENDGRID_API_KEY) return { statusCode: 500, body: "Missing SENDGRID_API_KEY" };
    if (!SENDGRID_LIST_ID) return { statusCode: 500, body: "Missing SENDGRID_LIST_ID" };

    const body = JSON.parse(event.body);
    const email = body?.payload?.data?.email;
    const name = body?.payload?.data?.name;
    if (!email) return { statusCode: 400, body: "Missing email" };

    console.log(`Submission: ${email}`);

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    };

    const contactsBody = JSON.stringify({
      list_ids: [SENDGRID_LIST_ID],
      contacts: [{ email, first_name: name }],
    });

    const response = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      body: contactsBody,
      headers,
    });

    const data = await response.text();
    console.log("Contacts response:", data);

    if (response.status === 202 && ADMIN_EMAIL && NOTIFICATION_EMAIL) {
      const notificationBody = JSON.stringify({
        personalizations: [{ to: [{ email: ADMIN_EMAIL }], subject: "Nuevo suscriptor" }],
        from: { email: NOTIFICATION_EMAIL },
        reply_to: { email: NOTIFICATION_EMAIL },
        content: [
          { type: "text/plain", value: `Nuevo correo registrado: ${email} - ${name ?? ""}` },
        ],
      });

      const notifResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        body: notificationBody,
        headers,
      });
      console.log("Notification response:", notifResponse.status);
    }

    return { statusCode: response.status, body: data };
  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, body: "Internal error" };
  }
};
