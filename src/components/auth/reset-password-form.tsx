"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setPending(true);
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    if (result.error) {
      setStatus("error");
      setMessage("El enlace no es válido o ya venció.");
      setPending(false);
      return;
    }
    setStatus("success");
    setMessage("Contraseña actualizada. Ya puedes ingresar.");
    setPending(false);
  }

  if (status === "success") {
    return (
      <div className="mt-8">
        <p role="status" className="rounded-lg bg-[#e8f3eb] px-4 py-3 text-sm text-[var(--forest)]">
          {message}
        </p>
        <Link
          href="/iniciar-sesion"
          className="mt-5 inline-flex font-bold text-[var(--earth)] underline underline-offset-4"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Nueva contraseña
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Confirma la contraseña
        <input
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"
        />
      </label>
      {message && (
        <p role="alert" className="rounded-lg bg-[#f8e7e2] px-4 py-3 text-sm text-[#7a3027]">
          {message}
        </p>
      )}
      <button
        disabled={pending}
        className="min-h-12 rounded-xl bg-[var(--forest)] px-5 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Actualizando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
