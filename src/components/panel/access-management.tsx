"use client";

import { useActionState } from "react";
import {
  createInvitationAction,
  retryEmailAction,
  revokeInvitationAction,
  type AccessActionState,
} from "@/app/panel/accesos/actions";
import type { OutboxItem } from "@/lib/email/outbox";
import type { ManagedAgency } from "@/lib/repositories/agencies";
import type { InvitationView } from "@/lib/repositories/invitations";

const initialState: AccessActionState = { status: "idle", message: "" };

const stateLabel = {
  pending: "Pendiente",
  accepted: "Aceptada",
  revoked: "Revocada",
  expired: "Vencida",
} as const;

const deliveryLabel = {
  pending: "Pendiente",
  processing: "Enviando",
  sent: "Enviado",
  failed: "Fallido",
  preview: "Vista previa local",
} as const;

export function AccessManagement({
  agencies,
  invitations,
  outbox,
}: {
  agencies: ManagedAgency[];
  invitations: InvitationView[];
  outbox: OutboxItem[];
}) {
  const [state, action, pending] = useActionState(
    createInvitationAction,
    initialState,
  );

  return (
    <>
      <form action={action} className="mt-8 grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-6">
        <h2 className="text-2xl text-[var(--forest)]">Nueva invitación</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
            Inmobiliaria
            <select name="agencyId" required className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal">
              <option value="">Selecciona</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>{agency.name}</option>
              ))}
            </select>
            <FieldError message={state.errors?.agencyId?.[0]} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
            Correo
            <input name="email" type="email" required className="min-h-12 rounded-xl border border-[var(--line)] px-4 font-normal" />
            <FieldError message={state.errors?.email?.[0]} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
            Rol
            <select name="role" defaultValue="editor" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal">
              <option value="editor">Editor</option>
              <option value="owner">Propietario</option>
            </select>
            <FieldError message={state.errors?.role?.[0]} />
          </label>
        </div>
        {state.message && (
          <p role="status" className={`rounded-lg px-4 py-3 text-sm ${
            state.status === "success"
              ? "bg-[#e8f3eb] text-[var(--forest)]"
              : "bg-[#f8e7e2] text-[#7a3027]"
          }`}>
            {state.message}
          </p>
        )}
        <button disabled={pending || !agencies.length} className="min-h-12 w-fit rounded-xl bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">
          {pending ? "Creando…" : "Crear invitación"}
        </button>
      </form>

      <section className="mt-12">
        <h2 className="text-2xl text-[var(--forest)]">Invitaciones</h2>
        <div className="mt-5 grid gap-3">
          {invitations.map((invitation) => (
            <article key={invitation.id} className="rounded-xl border border-[var(--line)] bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-[var(--forest)]">{invitation.email}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {invitation.agencyName} · {invitation.role} · {stateLabel[invitation.state]}
                  </p>
                </div>
                {invitation.state === "pending" && (
                  <form action={revokeInvitationAction}>
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <button className="min-h-10 rounded-lg border border-[#a95346] px-4 text-sm font-bold text-[#8b3f36]">
                      Revocar
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
          {!invitations.length && <Empty text="Todavía no hay invitaciones." />}
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <h2 className="text-2xl text-[var(--forest)]">Bandeja de salida</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          En modo local, abre la vista previa para probar el enlace sin enviar correo.
        </p>
        <div className="mt-5 grid gap-3">
          {outbox.map((message) => (
            <article key={message.id} className="rounded-xl border border-[var(--line)] bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-sans text-sm font-extrabold text-[var(--forest)]">{message.subject}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {message.recipient} · {deliveryLabel[message.status]} · {message.attempts} intentos
                  </p>
                  {message.lastError && <p className="mt-2 text-xs text-[#8b3f36]">{message.lastError}</p>}
                </div>
                {message.status === "failed" && message.attempts < 5 && (
                  <form action={retryEmailAction}>
                    <input type="hidden" name="outboxId" value={message.id} />
                    <button className="min-h-10 rounded-lg border border-[var(--forest)] px-4 text-sm font-bold text-[var(--forest)]">
                      Reintentar
                    </button>
                  </form>
                )}
              </div>
              {message.previewText && (
                <details className="mt-4 rounded-lg bg-[var(--sand-2)] p-4">
                  <summary className="cursor-pointer text-sm font-bold text-[var(--earth)]">Abrir vista previa local</summary>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-[var(--ink)]">{message.previewText}</pre>
                </details>
              )}
            </article>
          ))}
          {!outbox.length && <Empty text="La bandeja de salida está vacía." />}
        </div>
      </section>
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs font-normal text-[#9a3f34]">{message}</span> : null;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">{text}</p>;
}
