import Link from "next/link";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  ExistingAccountInvitationForm,
  NewAccountInvitationForm,
} from "@/components/auth/invitation-acceptance";
import { getCurrentActor } from "@/lib/auth/actor";
import { getInvitationByToken } from "@/lib/repositories/invitations";

export const metadata: Metadata = {
  title: "Aceptar invitación",
  robots: { index: false, follow: false },
};

function maskedEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token ?? "";
  const [invitation, actor] = await Promise.all([
    getInvitationByToken(token),
    getCurrentActor(),
  ]);

  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-12">
      <section className="w-full max-w-lg rounded-[1.5rem] border border-[var(--line)] bg-white p-7 soft-shadow sm:p-9">
        <p className="eyebrow">Acceso</p>
        <h1 className="mt-3 text-4xl text-[var(--forest)]">Acepta la invitación</h1>
        {!invitation || invitation.state !== "pending" ? (
          <InvalidInvitation />
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {invitation.agencyName} te invita como <strong>{invitation.role}</strong>{" "}
              usando {maskedEmail(invitation.email)}.
            </p>
            {invitation.existingUserId ? (
              actor?.email.toLowerCase() === invitation.email ? (
                <ExistingAccountInvitationForm token={token} />
              ) : actor ? (
                <div className="mt-8 rounded-lg bg-[#f8e7e2] p-4 text-sm text-[#7a3027]">
                  La sesión actual usa otro correo. Cierra sesión e ingresa con el correo invitado.
                  <SignOutButton tone="light" />
                </div>
              ) : (
                <Link
                  href={`/iniciar-sesion?callbackUrl=${encodeURIComponent(`/aceptar-invitacion?token=${token}`)}`}
                  className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[var(--forest)] px-5 font-bold text-white"
                >
                  Ingresar para aceptar
                </Link>
              )
            ) : actor ? (
              <div className="mt-8 rounded-lg bg-[#f8e7e2] p-4 text-sm text-[#7a3027]">
                Cierra la sesión actual antes de crear la cuenta invitada.
                <SignOutButton tone="light" />
              </div>
            ) : (
              <NewAccountInvitationForm token={token} />
            )}
          </>
        )}
      </section>
    </main>
  );
}

function InvalidInvitation() {
  return (
    <div className="mt-6">
      <p role="alert" className="rounded-lg bg-[#f8e7e2] px-4 py-3 text-sm text-[#7a3027]">
        La invitación no existe, venció, fue revocada o ya se utilizó.
      </p>
      <Link href="/iniciar-sesion" className="mt-5 inline-flex font-bold text-[var(--earth)] underline underline-offset-4">
        Ir al inicio de sesión
      </Link>
    </div>
  );
}
