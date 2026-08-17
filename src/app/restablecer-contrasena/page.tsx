import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Crear nueva contraseña",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const validToken = typeof token === "string" && token.length >= 20 && !error;

  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-12">
      <section className="w-full max-w-md rounded-[1.5rem] border border-[var(--line)] bg-white p-7 soft-shadow sm:p-9">
        <p className="eyebrow">Seguridad</p>
        <h1 className="mt-3 text-4xl text-[var(--forest)]">Crea una nueva contraseña</h1>
        {validToken ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p role="alert" className="mt-6 rounded-lg bg-[#f8e7e2] px-4 py-3 text-sm text-[#7a3027]">
            El enlace no es válido o ya venció. Solicita uno nuevo.
          </p>
        )}
      </section>
    </main>
  );
}

