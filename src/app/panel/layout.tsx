import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentActor } from "@/lib/auth/actor";

export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/iniciar-sesion?callbackUrl=/panel");

  return (
    <div className="container-shell py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-2xl bg-[var(--forest)] p-5 text-white lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8c983]">
            Panel
          </p>
          <p className="mt-2 text-sm text-white/70">{actor.name}</p>
          <nav aria-label="Administración" className="mt-6 grid gap-1">
            <Link href="/panel" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10">
              Resumen
            </Link>
            <Link href="/panel/perfil" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10">
              Perfil
            </Link>
            <Link href="/panel/propiedades" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10">
              Propiedades
            </Link>
            {actor.platformAdmin && (
              <>
                <Link href="/panel/moderacion" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10">
                  Moderación
                </Link>
                <Link href="/panel/accesos" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10">
                  Accesos y correo
                </Link>
              </>
            )}
          </nav>
          <SignOutButton />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
