const APP_NAME = "Raíz de Pueblo";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(title: string, content: string, actionLabel: string, url: string) {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#faf7f1;color:#1c2822;font-family:Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px">
      <div style="background:#fff;border:1px solid #dce2dd;border-radius:18px;padding:32px">
        <p style="margin:0 0 10px;color:#b56a43;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${APP_NAME}</p>
        <h1 style="margin:0;color:#17382c;font-size:28px">${escapeHtml(title)}</h1>
        <div style="margin-top:20px;line-height:1.65">${content}</div>
        <p style="margin:28px 0">
          <a href="${escapeHtml(url)}" style="display:inline-block;border-radius:10px;background:#17382c;padding:14px 20px;color:#fff;font-weight:700;text-decoration:none">${escapeHtml(actionLabel)}</a>
        </p>
        <p style="margin:20px 0 0;color:#66736c;font-size:13px">Si no esperabas este mensaje, puedes ignorarlo.</p>
      </div>
    </div>
  </body>
</html>`;
}

export function invitationEmail(input: {
  agencyName: string;
  role: "owner" | "editor";
  url: string;
}) {
  const roleLabel = input.role === "owner" ? "propietario" : "editor";
  const title = `Invitación a ${input.agencyName}`;
  return {
    subject: `${title} en ${APP_NAME}`,
    text: [
      title,
      "",
      `Te invitaron como ${roleLabel}. La invitación vence en 7 días.`,
      `Acepta la invitación: ${input.url}`,
      "",
      "Si no esperabas este mensaje, puedes ignorarlo.",
    ].join("\n"),
    html: emailShell(
      title,
      `<p>Te invitaron como <strong>${roleLabel}</strong>. La invitación vence en 7 días.</p>`,
      "Aceptar invitación",
      input.url,
    ),
  };
}

export function passwordResetEmail(url: string) {
  const title = "Restablece tu contraseña";
  return {
    subject: `${title} de ${APP_NAME}`,
    text: [
      title,
      "",
      "Este enlace vence en 1 hora y solo puede usarse una vez.",
      `Restablece tu contraseña: ${url}`,
      "",
      "Si no solicitaste el cambio, puedes ignorar este mensaje.",
    ].join("\n"),
    html: emailShell(
      title,
      "<p>Este enlace vence en 1 hora y solo puede usarse una vez.</p>",
      "Crear nueva contraseña",
      url,
    ),
  };
}

