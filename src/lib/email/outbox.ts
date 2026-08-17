import "server-only";

import { after } from "next/server";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { inTransaction, query } from "@/lib/db/pool";

export type EmailKind =
  | "invitation"
  | "password_reset"
  | "email_verification";
export type EmailStatus =
  | "pending"
  | "processing"
  | "sent"
  | "failed"
  | "preview";

export interface EmailMessage {
  kind: EmailKind;
  recipient: string;
  subject: string;
  text: string;
  html: string;
}

export interface OutboxItem {
  id: string;
  kind: EmailKind;
  recipient: string;
  subject: string;
  status: EmailStatus;
  attempts: number;
  lastError: string | null;
  previewText: string | null;
  createdAt: string;
  sentAt: string | null;
}

function deliveryMode(): "preview" | "smtp" {
  const configured =
    process.env.EMAIL_DELIVERY_MODE ??
    (process.env.NODE_ENV === "production" ? "smtp" : "preview");
  if (configured !== "preview" && configured !== "smtp") {
    throw new Error("EMAIL_DELIVERY_MODE debe ser preview o smtp.");
  }
  if (process.env.NODE_ENV === "production" && configured === "preview") {
    throw new Error("EMAIL_DELIVERY_MODE=preview no está permitido en producción.");
  }
  return configured;
}

export async function enqueueEmail(
  client: PoolClient,
  message: EmailMessage,
): Promise<string> {
  const id = randomUUID();
  const status = deliveryMode() === "preview" ? "preview" : "pending";
  await client.query(
    `insert into email_outbox (
      id, kind, recipient, subject, text_body, html_body, status
    ) values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      message.kind,
      message.recipient.trim().toLowerCase(),
      message.subject,
      message.text,
      message.html,
      status,
    ],
  );
  return id;
}

export async function queueEmail(message: EmailMessage): Promise<string> {
  return inTransaction((client) => enqueueEmail(client, message));
}

export function scheduleEmailDelivery(id: string): void {
  if (deliveryMode() === "preview") return;
  after(async () => {
    await deliverEmail(id);
  });
}

function safeErrorCode(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "UNKNOWN";
  const sanitized = code.replace(/[^A-Z0-9_-]/gi, "").slice(0, 40);
  return `Falló la entrega SMTP (${sanitized || "UNKNOWN"}).`;
}

export async function deliverEmail(id: string): Promise<boolean> {
  const claimed = await inTransaction(async (client) => {
    const result = await client.query<{
      recipient: string;
      subject: string;
      text_body: string;
      html_body: string;
      attempts: number;
    }>(
      `select recipient, subject, text_body, html_body, attempts
       from email_outbox
       where id = $1
         and (
           (status in ('pending', 'failed') and available_at <= current_timestamp)
           or (status = 'processing' and updated_at < current_timestamp - interval '10 minutes')
         )
         and attempts < 5
       for update`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    await client.query(
      `update email_outbox
       set status = 'processing', attempts = attempts + 1,
           last_error = null, updated_at = current_timestamp
       where id = $1`,
      [id],
    );
    return row;
  });

  if (!claimed) return false;
  const smtpUrl = process.env.SMTP_URL;
  const from = process.env.EMAIL_FROM;

  try {
    if (!smtpUrl || !from) {
      throw Object.assign(new Error("Configuración SMTP incompleta."), {
        code: "SMTP_CONFIG",
      });
    }
    const transport = nodemailer.createTransport(smtpUrl, {
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await transport.sendMail({
      from,
      to: claimed.recipient,
      subject: claimed.subject,
      text: claimed.text_body,
      html: claimed.html_body,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await query(
      `update email_outbox
       set status = 'sent', sent_at = current_timestamp,
           text_body = '[contenido sensible redactado después de la entrega]',
           html_body = '[contenido sensible redactado después de la entrega]',
           updated_at = current_timestamp
       where id = $1 and status = 'processing'`,
      [id],
    );
    return true;
  } catch (error) {
    const nextDelayMinutes = Math.min(2 ** claimed.attempts, 30);
    await query(
      `update email_outbox
       set status = 'failed',
           last_error = $2,
           available_at = current_timestamp + ($3 * interval '1 minute'),
           updated_at = current_timestamp
       where id = $1 and status = 'processing'`,
      [id, safeErrorCode(error), nextDelayMinutes],
    );
    return false;
  }
}

export async function retryEmail(id: string): Promise<void> {
  await query(
    `update email_outbox
     set status = 'pending', available_at = current_timestamp,
         last_error = null, updated_at = current_timestamp
     where id = $1 and status = 'failed' and attempts < 5`,
    [id],
  );
}

export async function listRecentOutbox(limit = 30): Promise<OutboxItem[]> {
  const result = await query<{
    id: string;
    kind: EmailKind;
    recipient: string;
    subject: string;
    status: EmailStatus;
    attempts: number;
    last_error: string | null;
    text_body: string;
    created_at: Date;
    sent_at: Date | null;
  }>(
    `select
      id, kind, recipient, subject, status, attempts, last_error,
      text_body, created_at, sent_at
     from email_outbox
     order by created_at desc
     limit $1`,
    [Math.min(Math.max(limit, 1), 100)],
  );
  return result.rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    recipient: row.recipient,
    subject: row.subject,
    status: row.status,
    attempts: row.attempts,
    lastError: row.last_error,
    previewText: row.status === "preview" ? row.text_body : null,
    createdAt: row.created_at.toISOString(),
    sentAt: row.sent_at?.toISOString() ?? null,
  }));
}
