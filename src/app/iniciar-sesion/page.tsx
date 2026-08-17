import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Ingresar al panel",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-12">
      <section className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-7 soft-shadow sm:p-9">
        <p className="eyebrow">Administración</p>
        <h1 className="mt-3 text-4xl text-[var(--forest)]">Ingresa a tu inmobiliaria</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Administra únicamente el perfil y las propiedades asociadas a tu cuenta.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm">Cargando formulario…</p>}>
          <SignInForm />
        </Suspense>
      </section>
    </main>
  );
}
