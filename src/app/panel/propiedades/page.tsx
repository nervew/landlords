import Link from "next/link";
import { archivePropertyAction } from "./actions";
import { submitPropertyAction } from "./submit-action";
import { getCurrentActor } from "@/lib/auth/actor";
import { listAgenciesForActor } from "@/lib/repositories/agencies";
import { listManagedProperties } from "@/lib/repositories/properties";

const statusLabel = {
  draft: "Borrador",
  pending_review: "En revisión",
  published: "Publicada",
  rejected: "Rechazada",
  archived: "Archivada",
} as const;

interface PropertiesPanelProps {
  searchParams: Promise<{ agencia?: string }>;
}

export default async function PropertiesPanelPage({
  searchParams,
}: PropertiesPanelProps) {
  const actor = await getCurrentActor();
  if (!actor) return null;
  const agencies = await listAgenciesForActor(actor);
  const requested = (await searchParams).agencia;
  const agencyId = requested ?? agencies[0]?.id;
  const selectedAgency = agencies.find((agency) => agency.id === agencyId);
  const properties = agencyId
    ? await listManagedProperties(actor, agencyId)
    : [];

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Inventario</p>
          <h1 className="mt-3 text-4xl text-[var(--forest)]">Propiedades</h1>
        </div>
        {agencyId && (
          <Link
            href={`/panel/propiedades/nueva?agencia=${agencyId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--forest)] px-5 text-sm font-bold text-white"
          >
            Crear propiedad
          </Link>
        )}
      </div>
      {agencies.length > 1 && (
        <nav aria-label="Elegir inmobiliaria" className="mt-6 flex flex-wrap gap-2">
          {agencies.map((agency) => (
            <Link
              key={agency.id}
              href={`/panel/propiedades?agencia=${agency.id}`}
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                agency.id === agencyId
                  ? "border-[var(--forest)] bg-[var(--forest)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--forest)]"
              }`}
            >
              {agency.name}
            </Link>
          ))}
        </nav>
      )}
      {selectedAgency?.status === "suspended" && (
        <p className="mt-6 rounded-xl bg-[#f8e7e2] px-5 py-4 text-sm text-[#7a3027]">
          Esta inmobiliaria está suspendida. Puedes conservar borradores, pero no
          enviarlos a publicación hasta que un administrador reactive la cuenta.
        </p>
      )}
      {selectedAgency?.status === "pending" && (
        <p className="mt-6 rounded-xl bg-[#f4eadb] px-5 py-4 text-sm text-[#6b5948]">
          Las propiedades enviadas pasarán a revisión administrativa.
        </p>
      )}
      {selectedAgency?.status === "verified" && (
        <p className="mt-6 rounded-xl bg-[#e8f3eb] px-5 py-4 text-sm text-[var(--forest)]">
          Inmobiliaria verificada: las propiedades enviadas se publicarán directamente.
        </p>
      )}
      <div className="mt-8 grid gap-4">
        {properties.map((property) => (
          <article key={property.id} className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl text-[var(--forest)]">{property.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {property.municipality} · {property.imageCount} imágenes
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#edf2ee] px-3 py-1.5 text-xs font-bold text-[var(--forest)]">
                {statusLabel[property.status]}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href={`/panel/propiedades/${property.id}`}
                className="text-sm font-bold text-[var(--earth)] underline underline-offset-4"
              >
                Editar
              </Link>
              {property.status !== "archived" && (
                <form action={archivePropertyAction}>
                  <input type="hidden" name="propertyId" value={property.id} />
                  <button className="text-sm font-bold text-[#8b3f36] underline underline-offset-4">
                    Archivar
                  </button>
                </form>
              )}
              {selectedAgency?.status !== "suspended" &&
                ["draft", "rejected"].includes(property.status) && (
                <form action={submitPropertyAction}>
                  <input type="hidden" name="propertyId" value={property.id} />
                  <button className="text-sm font-bold text-[#26734c] underline underline-offset-4">
                    Enviar a publicación
                  </button>
                </form>
                )}
            </div>
          </article>
        ))}
        {!properties.length && (
          <p className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">
            Esta inmobiliaria todavía no tiene propiedades.
          </p>
        )}
      </div>
    </section>
  );
}
