"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PasswordRecoveryForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    await authClient.requestPasswordReset({
      email: String(form.get("email") ?? "").trim().toLowerCase(),
      redirectTo: "/restablecer-contrasena",
    });
    setMessage(
      "Si el correo corresponde a una cuenta, recibirás un enlace para continuar.",
    );
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Correo electrónico
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"
        />
      </label>
      {message && (
        <p role="status" className="rounded-lg bg-[#e8f3eb] px-4 py-3 text-sm text-[var(--forest)]">
          {message}
        </p>
      )}
      <button
        disabled={pending}
        className="min-h-12 rounded-xl bg-[var(--forest)] px-5 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Solicitando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
