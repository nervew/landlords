import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/panel/property-form";
import { getCurrentActor } from "@/lib/auth/actor";
import { getAgencyForActor } from "@/lib/repositories/agencies";

interface NewPropertyPageProps {
  searchParams: Promise<{ agencia?: string }>;
}

export default async function NewPropertyPage({
  searchParams,
}: NewPropertyPageProps) {
  const actor = await getCurrentActor();
  if (!actor) return null;
  const agencyId = (await searchParams).agencia;
  if (!agencyId) notFound();
  const agency = await getAgencyForActor(actor, agencyId);
  if (!agency) notFound();

  return (
    <section>
      <p className="eyebrow">Nueva propiedad</p>
      <h1 className="mt-3 text-4xl text-[var(--forest)]">Crear borrador</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Inmobiliaria: {agency.name}. La publicación se decidirá al enviar a revisión.
      </p>
      <PropertyForm agencyId={agency.id} />
    </section>
  );
}
