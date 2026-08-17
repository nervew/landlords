import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "@/components/properties/catalog-client";
import { listPublishedProperties } from "@/lib/repositories/public-content";
import Loading from "./loading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lotes y terrenos en venta en Colombia",
  description:
    "Explora lotes, fincas y terrenos demostrativos en municipios de Colombia. Filtra por ubicación, precio, área y uso.",
  alternates: {
    canonical: "/propiedades",
  },
  openGraph: {
    title: "Lotes y terrenos en venta en Colombia",
    description:
      "Explora propiedades rurales y urbanas con información localizada y contacto directo.",
    url: "/propiedades",
  },
};

export default async function PropertiesPage() {
  const properties = await listPublishedProperties();
  return (
    <>
      <section className="bg-[var(--forest)] py-14 text-white md:py-20">
        <div className="container-shell">
          <p className="eyebrow !text-[#e8c983]">Oportunidades en el territorio</p>
          <h1 className="mt-3 max-w-4xl text-balance text-[clamp(2.7rem,6vw,5.2rem)] leading-[.96]">
            Lotes, fincas y terrenos para mirar más allá de la ciudad
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Compara opciones con datos claros y conversa directamente con
            inmobiliarias que conocen cada municipio.
          </p>
        </div>
      </section>
      <Suspense fallback={<Loading />}>
        <CatalogClient properties={properties} />
      </Suspense>
    </>
  );
}
