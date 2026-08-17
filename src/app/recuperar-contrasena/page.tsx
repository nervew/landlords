import Link from "next/link";
import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function PasswordRecoveryPage() {
  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-12">
      <section className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-7 soft-shadow sm:p-9">
        <p className="eyebrow">Seguridad</p>
        <h1 className="mt-3 text-4xl text-[var(--forest)]">Recupera tu acceso</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          La respuesta será la misma exista o no una cuenta para ese correo.
        </p>
        <PasswordRecoveryForm />
        <Link
          href="/iniciar-sesion"
          className="mt-6 inline-flex text-sm font-bold text-[var(--earth)] underline underline-offset-4"
        >
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}

