"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      rememberMe: true,
    });

    if (result.error) {
      setError("Correo o contraseña incorrectos.");
      setPending(false);
      return;
    }

    const callback = searchParams.get("callbackUrl");
    router.replace(callback?.startsWith("/") ? callback : "/panel");
    router.refresh();
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
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"
        />
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-[#f8e7e2] px-4 py-3 text-sm text-[#7a3027]">
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="min-h-12 rounded-xl bg-[var(--forest)] px-5 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar al panel"}
      </button>
      <Link
        href="/recuperar-contrasena"
        className="text-center text-sm font-bold text-[var(--earth)] underline underline-offset-4"
      >
        Olvidé mi contraseña
      </Link>
    </form>
  );
}
