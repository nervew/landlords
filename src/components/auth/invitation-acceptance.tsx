"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  acceptExistingInvitationAction,
  acceptNewInvitationAction,
  type InvitationActionState,
} from "@/app/aceptar-invitacion/actions";

const initialState: InvitationActionState = { status: "idle", message: "" };

export function NewAccountInvitationForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    acceptNewInvitationAction,
    initialState,
  );
  if (state.status === "success") return <Success message={state.message} href="/iniciar-sesion" />;

  return (
    <form action={action} className="mt-8 grid gap-5">
      <input type="hidden" name="token" value={token} />
      <Field label="Nombre" name="name" autoComplete="name" error={state.errors?.name?.[0]} />
      <Field label="Contraseña" name="password" type="password" autoComplete="new-password" minLength={12} error={state.errors?.password?.[0]} />
      <Field label="Confirma la contraseña" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} error={state.errors?.confirmPassword?.[0]} />
      {state.message && <Status state={state.status} message={state.message} />}
      <button disabled={pending} className="min-h-12 rounded-xl bg-[var(--forest)] px-5 font-bold text-white disabled:opacity-60">
        {pending ? "Creando cuenta…" : "Crear cuenta y aceptar"}
      </button>
    </form>
  );
}

export function ExistingAccountInvitationForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    acceptExistingInvitationAction,
    initialState,
  );
  if (state.status === "success") return <Success message={state.message} href="/panel" />;
  return (
    <form action={action} className="mt-8 grid gap-4">
      <input type="hidden" name="token" value={token} />
      {state.message && <Status state={state.status} message={state.message} />}
      <button disabled={pending} className="min-h-12 rounded-xl bg-[var(--forest)] px-5 font-bold text-white disabled:opacity-60">
        {pending ? "Aceptando…" : "Aceptar invitación"}
      </button>
    </form>
  );
}

function Success({ message, href }: { message: string; href: string }) {
  return (
    <div className="mt-8">
      <Status state="success" message={message} />
      <Link href={href} className="mt-5 inline-flex font-bold text-[var(--earth)] underline underline-offset-4">
        {href === "/panel" ? "Ir al panel" : "Ir al inicio de sesión"}
      </Link>
    </div>
  );
}

function Status({ state, message }: { state: "idle" | "success" | "error"; message: string }) {
  return (
    <p role={state === "error" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ${
      state === "success"
        ? "bg-[#e8f3eb] text-[var(--forest)]"
        : "bg-[#f8e7e2] text-[#7a3027]"
    }`}>
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  minLength,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
      {label}
      <input name={name} type={type} autoComplete={autoComplete} minLength={minLength} maxLength={128} required className="min-h-12 rounded-xl border border-[var(--line)] px-4 font-normal" />
      {error && <span className="text-xs font-normal text-[#9a3f34]">{error}</span>}
    </label>
  );
}
