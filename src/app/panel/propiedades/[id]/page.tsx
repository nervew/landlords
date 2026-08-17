import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/panel/property-form";
import { getCurrentActor } from "@/lib/auth/actor";
import { getManagedProperty } from "@/lib/repositories/properties";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const actor = await getCurrentActor();
  if (!actor) return null;
  const property = await getManagedProperty(actor, (await params).id);
  if (!property) notFound();

  return (
    <section>
      <p className="eyebrow">Editar propiedad</p>
      <h1 className="mt-3 text-4xl text-[var(--forest)]">{property.title}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Los cambios sobre una propiedad publicada la devuelven a borrador.
      </p>
      <PropertyForm agencyId={property.agencyId} property={property} />
    </section>
  );
}
