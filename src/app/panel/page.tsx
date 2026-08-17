import Link from "next/link";
import { getCurrentActor } from "@/lib/auth/actor";
import { listAgenciesForActor } from "@/lib/repositories/agencies";

const statusLabel = {
  pending: "Pendiente de verificación",
  verified: "Verificada",
  suspended: "Suspendida",
} as const;

export default async function PanelPage() {
  const actor = await getCurrentActor();
  if (!actor) return null;
  const agencies = await listAgenciesForActor(actor);

  return (
    <section>
      <p className="eyebrow">Resumen</p>
      <h1 className="mt-3 text-4xl text-[var(--forest)]">Tus inmobiliarias</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {actor.platformAdmin
          ? "Vista administrativa de todas las inmobiliarias."
          : "Solo puedes consultar y modificar las inmobiliarias asociadas a tu cuenta."}
      </p>
      <div className="mt-8 grid gap-4">
        {agencies.map((agency) => (
          <article key={agency.id} className="rounded-2xl border border-[var(--line)] bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl text-[var(--forest)]">{agency.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {agency.municipality}, {agency.department} · {agency.propertyCount} propiedades
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#edf2ee] px-4 py-2 text-xs font-bold text-[var(--forest)]">
                {statusLabel[agency.status]}
              </span>
            </div>
            <Link
              href={`/panel/perfil?agencia=${agency.id}`}
              className="mt-5 inline-flex text-sm font-bold text-[var(--earth)] underline underline-offset-4"
            >
              Editar perfil
            </Link>
          </article>
        ))}
        {!agencies.length && (
          <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">
            Tu cuenta todavía no está asociada a una inmobiliaria.
          </div>
        )}
      </div>
    </section>
  );
}
