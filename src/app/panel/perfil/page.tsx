import Link from "next/link";
import { AgencyProfileForm } from "@/components/panel/agency-profile-form";
import { getCurrentActor } from "@/lib/auth/actor";
import {
  getAgencyForActor,
  listAgenciesForActor,
} from "@/lib/repositories/agencies";

interface ProfilePageProps {
  searchParams: Promise<{ agencia?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const actor = await getCurrentActor();
  if (!actor) return null;
  const agencies = await listAgenciesForActor(actor);
  const requestedId = (await searchParams).agencia;
  const selectedId = requestedId ?? agencies[0]?.id;
  const agency = selectedId ? await getAgencyForActor(actor, selectedId) : null;

  return (
    <section>
      <p className="eyebrow">Perfil</p>
      <h1 className="mt-3 text-4xl text-[var(--forest)]">Información de la inmobiliaria</h1>
      {agencies.length > 1 && (
        <nav aria-label="Elegir inmobiliaria" className="mt-6 flex flex-wrap gap-2">
          {agencies.map((item) => (
            <Link
              key={item.id}
              href={`/panel/perfil?agencia=${item.id}`}
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                item.id === selectedId
                  ? "border-[var(--forest)] bg-[var(--forest)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--forest)]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
      {agency ? (
        <>
          <p className="mt-4 text-sm text-[var(--muted)]">
            El estado de confianza solo puede cambiarlo un administrador.
          </p>
          <AgencyProfileForm agency={agency} />
        </>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          No existe una inmobiliaria disponible para editar.
        </p>
      )}
    </section>
  );
}
