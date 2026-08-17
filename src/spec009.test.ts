// @vitest-environment node

import { randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import type { Actor } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization";
import { invitationSignupHeaders } from "@/lib/auth/invitation-signup";
import {
  deliverEmail,
  queueEmail,
  retryEmail,
} from "@/lib/email/outbox";
import { invitationEmail, passwordResetEmail } from "@/lib/email/templates";
import {
  acceptExistingInvitation,
  acceptNewInvitation,
  createInvitation,
  getInvitationByToken,
  revokeInvitation,
} from "@/lib/repositories/invitations";
import {
  acceptInvitationSchema,
  createInvitationSchema,
} from "@/lib/validation/invitation";

const admin: Actor = {
  userId: "user-platform-admin",
  email: "admin@raizdepueblo.local",
  name: "Administrador local",
  platformAdmin: true,
  agencyIds: [],
};
const member: Actor = {
  userId: "user-agency-member",
  email: "agencia@raizdepueblo.local",
  name: "Gestor de inmobiliaria",
  platformAdmin: false,
  agencyIds: ["ag-boyaca-raiz"],
};

describe("SPEC009 validación y plantillas", () => {
  it("normaliza el correo y exige contraseñas coincidentes", () => {
    expect(
      createInvitationSchema.parse({
        agencyId: "ag-boyaca-raiz",
        email: "  PERSONA@Example.COM ",
        role: "editor",
      }).email,
    ).toBe("persona@example.com");

    expect(
      acceptInvitationSchema.safeParse({
        token: "t".repeat(40),
        name: "Persona Invitada",
        password: "UnaClaveSegura2026!",
        confirmPassword: "otra-clave-segura",
      }).success,
    ).toBe(false);
  });

  it("genera mensajes con vigencia y enlaces explícitos", () => {
    const invitation = invitationEmail({
      agencyName: "Agencia <Local>",
      role: "editor",
      url: "https://example.com/invitacion",
    });
    const reset = passwordResetEmail("https://example.com/reset");

    expect(invitation.text).toContain("vence en 7 días");
    expect(invitation.html).toContain("Agencia &lt;Local&gt;");
    expect(reset.text).toContain("vence en 1 hora");
  });
});

const runDatabaseTests = process.env.RUN_DB_TESTS === "1";
const databasePool = runDatabaseTests
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;
const cleanupEmails = new Set<string>();
const cleanupInvitationIds = new Set<string>();
const cleanupOutboxIds = new Set<string>();
const cleanupMemberships = new Set<string>();

function tokenFromText(text: string): string {
  const match = text.match(/[?&]token=([A-Za-z0-9_-]+)/);
  if (!match) throw new Error("La vista previa no contiene token.");
  return match[1];
}

async function invitationToken(outboxId: string): Promise<string> {
  const result = await databasePool!.query<{ text_body: string }>(
    "select text_body from email_outbox where id = $1",
    [outboxId],
  );
  return tokenFromText(result.rows[0].text_body);
}

async function startLocalSmtp() {
  const server = createServer((socket) => {
    socket.setEncoding("utf8");
    socket.write("220 localhost ESMTP test\r\n");
    let buffer = "";
    let readingData = false;
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (readingData) {
          if (line === ".") {
            readingData = false;
            socket.write("250 queued\r\n");
          }
          continue;
        }
        if (/^(EHLO|HELO)\b/i.test(line)) {
          socket.write("250-localhost\r\n250 PIPELINING\r\n");
        } else if (/^(MAIL FROM|RCPT TO|RSET|NOOP)\b/i.test(line)) {
          socket.write("250 ok\r\n");
        } else if (/^DATA\b/i.test(line)) {
          readingData = true;
          socket.write("354 end with <CRLF>.<CRLF>\r\n");
        } else if (/^QUIT\b/i.test(line)) {
          socket.end("221 bye\r\n");
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("No fue posible iniciar SMTP local.");
  }
  return {
    url: `smtp://127.0.0.1:${address.port}?ignoreTLS=true`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

describe.skipIf(!runDatabaseTests)("SPEC009 integración PostgreSQL", () => {
  beforeAll(() => {
    process.env.EMAIL_DELIVERY_MODE = "preview";
  });

  afterAll(async () => {
    if (!databasePool) return;
    if (cleanupMemberships.size) {
      await databasePool.query(
        `delete from agency_members
         where (agency_id || ':' || user_id) = any($1::text[])`,
        [[...cleanupMemberships]],
      );
    }
    if (cleanupEmails.size) {
      await databasePool.query(
        `delete from "user" where lower(email) = any($1::text[])`,
        [[...cleanupEmails]],
      );
      await databasePool.query(
        `delete from email_outbox where recipient = any($1::text[])`,
        [[...cleanupEmails]],
      );
    }
    if (cleanupInvitationIds.size) {
      await databasePool.query(
        "delete from invitations where id = any($1::text[])",
        [[...cleanupInvitationIds]],
      );
    }
    if (cleanupOutboxIds.size) {
      await databasePool.query(
        "delete from email_outbox where id = any($1::text[])",
        [[...cleanupOutboxIds]],
      );
    }
    await databasePool.end();
  });

  it(
    "bloquea registro directo y restringe invitaciones al administrador",
    async () => {
      const { auth } = await import("@/lib/auth");
      await expect(
        auth.api.signUpEmail({
          body: {
            email: `directo-${randomUUID()}@example.test`,
            name: "Registro directo",
            password: "UnaClaveDirecta2026!",
          },
        }),
      ).rejects.toMatchObject({ status: "FORBIDDEN" });

      await expect(
        createInvitation(member, {
          agencyId: "ag-boyaca-raiz",
          email: `sin-permiso-${randomUUID()}@example.test`,
          role: "editor",
        }),
      ).rejects.toBeInstanceOf(AuthorizationError);
    },
    15_000,
  );

  it("crea, acepta y audita una cuenta nueva invitada", async () => {
    const email = `invitado-${randomUUID()}@example.test`;
    cleanupEmails.add(email);
    const created = await createInvitation(admin, {
      agencyId: "ag-tierra-cafetera",
      email,
      role: "editor",
    });
    cleanupInvitationIds.add(created.invitationId);
    cleanupOutboxIds.add(created.outboxId);
    const token = await invitationToken(created.outboxId);
    const { auth } = await import("@/lib/auth");

    await acceptNewInvitation(token, async (invitedEmail) => {
      const result = await auth.api.signUpEmail({
        headers: invitationSignupHeaders(token),
        body: {
          email: invitedEmail,
          name: "Persona Invitada",
          password: "UnaClaveInvitada2026!",
          rememberMe: false,
        },
      });
      return result.user.id;
    });

    const result = await databasePool!.query<{
      emailVerified: boolean;
      role: string;
      status: string;
      audit_count: string;
    }>(
      `select
        u."emailVerified",
        am.role,
        i.status,
        (
          select count(*)::text from audit_events ae
          where ae.entity_id = i.id and ae.action = 'invitation.accepted'
        ) as audit_count
       from invitations i
       join "user" u on lower(u.email) = i.email
       join agency_members am
         on am.user_id = u.id and am.agency_id = i.agency_id
       where i.id = $1`,
      [created.invitationId],
    );
    expect(result.rows[0]).toEqual({
      emailVerified: true,
      role: "editor",
      status: "accepted",
      audit_count: "1",
    });
    await expect(getInvitationByToken(token)).resolves.toMatchObject({
      state: "accepted",
    });
  });

  it("permite a una cuenta existente aceptar otra inmobiliaria y revocar pendientes", async () => {
    const existing = await createInvitation(admin, {
      agencyId: "ag-tierra-cafetera",
      email: member.email,
      role: "owner",
    });
    cleanupInvitationIds.add(existing.invitationId);
    cleanupOutboxIds.add(existing.outboxId);
    cleanupMemberships.add(`ag-tierra-cafetera:${member.userId}`);
    const token = await invitationToken(existing.outboxId);

    await acceptExistingInvitation(member, token);
    const membership = await databasePool!.query<{ role: string }>(
      `select role from agency_members
       where agency_id = 'ag-tierra-cafetera' and user_id = $1`,
      [member.userId],
    );
    expect(membership.rows[0].role).toBe("owner");

    const pendingEmail = `revocada-${randomUUID()}@example.test`;
    cleanupEmails.add(pendingEmail);
    const pending = await createInvitation(admin, {
      agencyId: "ag-boyaca-raiz",
      email: pendingEmail,
      role: "editor",
    });
    cleanupInvitationIds.add(pending.invitationId);
    cleanupOutboxIds.add(pending.outboxId);
    const pendingToken = await invitationToken(pending.outboxId);
    await revokeInvitation(admin, pending.invitationId);
    await expect(getInvitationByToken(pendingToken)).resolves.toMatchObject({
      state: "revoked",
    });
  });

  it("recupera la contraseña con respuesta genérica y revoca sesiones", async () => {
    const email = `recuperacion-${randomUUID()}@example.test`;
    cleanupEmails.add(email);
    const created = await createInvitation(admin, {
      agencyId: "ag-boyaca-raiz",
      email,
      role: "editor",
    });
    cleanupInvitationIds.add(created.invitationId);
    cleanupOutboxIds.add(created.outboxId);
    const invitationTokenValue = await invitationToken(created.outboxId);
    const { auth } = await import("@/lib/auth");
    let userId = "";
    await acceptNewInvitation(invitationTokenValue, async (invitedEmail) => {
      const result = await auth.api.signUpEmail({
        headers: invitationSignupHeaders(invitationTokenValue),
        body: {
          email: invitedEmail,
          name: "Cuenta Recuperable",
          password: "ClaveOriginal2026!",
          rememberMe: false,
        },
      });
      userId = result.user.id;
      return userId;
    });
    await auth.api.signInEmail({
      body: { email, password: "ClaveOriginal2026!" },
    });

    const response = await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/restablecer-contrasena" },
    });
    const unknown = await auth.api.requestPasswordReset({
      body: {
        email: `ausente-${randomUUID()}@example.test`,
        redirectTo: "/restablecer-contrasena",
      },
    });
    expect(unknown.message).toBe(response.message);

    const mail = await databasePool!.query<{
      id: string;
      text_body: string;
    }>(
      `select id, text_body from email_outbox
       where recipient = $1 and kind = 'password_reset'
       order by created_at desc limit 1`,
      [email],
    );
    cleanupOutboxIds.add(mail.rows[0].id);
    const resetToken =
      mail.rows[0].text_body.match(/reset-password\/([^?]+)/)?.[1];
    expect(resetToken).toBeTruthy();
    await auth.api.resetPassword({
      body: { token: resetToken, newPassword: "ClaveRenovada2026!" },
    });

    await expect(
      auth.api.signInEmail({
        body: { email, password: "ClaveOriginal2026!" },
      }),
    ).rejects.toBeTruthy();
    await expect(
      auth.api.signInEmail({
        body: { email, password: "ClaveRenovada2026!" },
      }),
    ).resolves.toMatchObject({ user: { email } });
    const sessions = await databasePool!.query<{ count: string }>(
      `select count(*)::text as count from session where "userId" = $1`,
      [userId],
    );
    expect(Number(sessions.rows[0].count)).toBe(1);
    const audit = await databasePool!.query<{ count: string }>(
      `select count(*)::text as count from audit_events
       where entity_id = $1 and action = 'user.password_reset'`,
      [userId],
    );
    expect(audit.rows[0].count).toBe("1");
  });

  it("conserva fallos SMTP sin credenciales y permite reintento", async () => {
    const previousMode = process.env.EMAIL_DELIVERY_MODE;
    const previousUrl = process.env.SMTP_URL;
    const previousFrom = process.env.EMAIL_FROM;
    process.env.EMAIL_DELIVERY_MODE = "smtp";
    delete process.env.SMTP_URL;
    delete process.env.EMAIL_FROM;
    const email = `smtp-${randomUUID()}@example.test`;
    cleanupEmails.add(email);
    const id = await queueEmail({
      kind: "email_verification",
      recipient: email,
      subject: "Prueba SMTP",
      text: "Mensaje sin secretos.",
      html: "<p>Mensaje sin secretos.</p>",
    });
    cleanupOutboxIds.add(id);
    await expect(deliverEmail(id)).resolves.toBe(false);
    const failed = await databasePool!.query<{
      status: string;
      last_error: string;
      attempts: number;
    }>(
      "select status, last_error, attempts from email_outbox where id = $1",
      [id],
    );
    expect(failed.rows[0]).toMatchObject({
      status: "failed",
      last_error: "Falló la entrega SMTP (SMTP_CONFIG).",
      attempts: 1,
    });
    await retryEmail(id);
    await expect(
      databasePool!.query("select status from email_outbox where id = $1", [id]),
    ).resolves.toMatchObject({ rows: [{ status: "pending" }] });
    process.env.EMAIL_DELIVERY_MODE = previousMode;
    if (previousUrl) process.env.SMTP_URL = previousUrl;
    if (previousFrom) process.env.EMAIL_FROM = previousFrom;
  });

  it("entrega por SMTP y redacta el enlace después del envío", async () => {
    const previousMode = process.env.EMAIL_DELIVERY_MODE;
    const previousUrl = process.env.SMTP_URL;
    const previousFrom = process.env.EMAIL_FROM;
    const smtp = await startLocalSmtp();
    try {
      process.env.EMAIL_DELIVERY_MODE = "smtp";
      process.env.SMTP_URL = smtp.url;
      process.env.EMAIL_FROM = "Raíz de Pueblo <pruebas@example.test>";
      const email = `smtp-ok-${randomUUID()}@example.test`;
      cleanupEmails.add(email);
      const id = await queueEmail({
        kind: "email_verification",
        recipient: email,
        subject: "Entrega SMTP local",
        text: "Enlace sensible: https://example.test/token",
        html: "<p>Enlace sensible: https://example.test/token</p>",
      });
      cleanupOutboxIds.add(id);

      await expect(deliverEmail(id)).resolves.toBe(true);
      const sent = await databasePool!.query<{
        status: string;
        text_body: string;
        html_body: string;
        sent_at: Date | null;
      }>(
        `select status, text_body, html_body, sent_at
         from email_outbox where id = $1`,
        [id],
      );
      expect(sent.rows[0]).toMatchObject({
        status: "sent",
        text_body: "[contenido sensible redactado después de la entrega]",
        html_body: "[contenido sensible redactado después de la entrega]",
      });
      expect(sent.rows[0].sent_at).toBeInstanceOf(Date);
    } finally {
      await smtp.close();
      process.env.EMAIL_DELIVERY_MODE = previousMode;
      if (previousUrl) process.env.SMTP_URL = previousUrl;
      else delete process.env.SMTP_URL;
      if (previousFrom) process.env.EMAIL_FROM = previousFrom;
      else delete process.env.EMAIL_FROM;
    }
  });
});
