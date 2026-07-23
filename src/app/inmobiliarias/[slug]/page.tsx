import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { JsonLd } from "@/components/seo/json-ld";
import { agencies, getAgencyBySlug } from "@/data/agencies";
import { properties } from "@/data/properties";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import { agencyJsonLd } from "@/lib/seo";

interface AgencyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return agencies.map((agency) => ({ slug: agency.slug }));
}

export async function generateMetadata({
  params,
}: AgencyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agency = getAgencyBySlug(slug);
  if (!agency) return {};

  return {
    title: agency.name,
    description: `${agency.description} Conoce sus propiedades demostrativas en ${agency.municipality}, ${agency.department}.`,
    alternates: {
      canonical: `/inmobiliarias/${agency.slug}`,
    },
    openGraph: {
      title: agency.name,
      description: agency.description,
      url: `/inmobiliarias/${agency.slug}`,
      locale: "es_CO",
      type: "website",
    },
  };
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const { slug } = await params;
  const agency = getAgencyBySlug(slug);
  if (!agency) notFound();

  const inventory = properties.filter((property) => property.agencyId === agency.id);
  const whatsappUrl = createWhatsAppUrl(
    agency.whatsapp,
    `Hola, quiero conocer las propiedades publicadas por ${agency.name} en Raíz de Pueblo.`,
  );

  return (
    <>
      <JsonLd data={agencyJsonLd(agency)} />
      <section className="bg-[var(--forest)] py-12 text-white md:py-20">
        <div className="container-shell">
          <Link href="/propiedades" className="inline-flex items-center gap-2 text-sm font-bold text-white/75">
            <ArrowLeft aria-hidden="true" size={17} /> Volver al catálogo
          </Link>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <span className="grid size-24 shrink-0 place-items-center rounded-full bg-[#f0dfc4] font-serif text-3xl font-bold text-[var(--forest)]">
                {agency.logo}
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[.16em] text-[#e8c983]">Inmobiliaria local</p>
                <h1 className="mt-2 text-balance text-[clamp(2.8rem,6vw,5.5rem)] leading-[.96]">{agency.name}</h1>
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
                  <MapPin aria-hidden="true" size={18} />
                  {agency.municipality}, {agency.department}
                </p>
              </div>
            </div>
            {agency.verified ? (
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">
                <BadgeCheck aria-hidden="true" className="text-[#e8c983]" size={20} />
                Contacto confirmado
                <span className="font-normal text-white/55">· demostración</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">
                <Info aria-hidden="true" className="text-[#e8c983]" size={20} />
                Sin verificación documental
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-shell py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="eyebrow">Conocimiento local</p>
            <h2 className="mt-3 text-4xl text-[var(--forest)]">Sobre la inmobiliaria</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">{agency.description}</p>
            <div className="mt-8 rounded-xl border border-[#dbc9ac] bg-[#f4eadb] p-5 text-sm leading-6 text-[#6b5948]">
              Este perfil y sus datos de contacto son ficticios. El indicador de contacto
              existe únicamente para demostrar la interfaz y no constituye certificación legal.
            </div>
          </section>

          <aside className="rounded-2xl border border-[var(--line)] bg-white p-6 soft-shadow">
            <h2 className="font-sans text-lg font-extrabold text-[var(--forest)]">Datos de contacto</h2>
            <div className="mt-5 grid gap-4 text-sm text-[var(--muted)]">
              <a href={`tel:${agency.phone}`} className="inline-flex items-center gap-3">
                <Phone aria-hidden="true" size={18} className="text-[var(--earth)]" />
                {agency.phone}
              </a>
              <a href={`mailto:${agency.email}`} className="inline-flex items-center gap-3">
                <Mail aria-hidden="true" size={18} className="text-[var(--earth)]" />
                {agency.email}
              </a>
              <span className="inline-flex items-center gap-3">
                <Building2 aria-hidden="true" size={18} className="text-[var(--earth)]" />
                {inventory.length} {inventory.length === 1 ? "propiedad publicada" : "propiedades publicadas"}
              </span>
            </div>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1f8f55] font-bold text-white"
              >
                <MessageCircle aria-hidden="true" size={19} /> Escribir por WhatsApp
              </a>
            )}
          </aside>
        </div>

        <section className="mt-16 border-t border-[var(--line)] pt-12">
          <p className="eyebrow">Inventario publicado</p>
          <h2 className="section-title mt-3">Propiedades de {agency.name}</h2>
          {inventory.length > 0 ? (
            <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inventory.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-2xl border border-dashed border-[var(--line)] bg-white p-10 text-center">
              <h3 className="text-2xl text-[var(--forest)]">No hay propiedades publicadas</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Vuelve pronto para consultar nuevas opciones.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
