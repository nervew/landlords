import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Car,
  Check,
  FileText,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Ruler,
  Sparkles,
  Zap,
} from "lucide-react";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { InquiryForm } from "@/components/properties/inquiry-form";
import { PropertyCard } from "@/components/properties/property-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getAgencyById } from "@/data/agencies";
import { getPropertyBySlug, properties } from "@/data/properties";
import {
  formatArea,
  formatPrice,
  formatPropertyType,
  formatPublishedDate,
} from "@/lib/format";
import { getRelatedProperties } from "@/lib/properties";
import { propertyJsonLd } from "@/lib/seo";
import { createWhatsAppUrl } from "@/lib/whatsapp";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) return {};

  return {
    title: `${property.title} en ${property.municipality}`,
    description: `${formatPropertyType(property.propertyType)} de ${formatArea(property.area, property.areaUnit)} en ${property.municipality}, ${property.department}. ${property.description}`,
    openGraph: {
      title: property.title,
      description: `${formatPrice(property.price)} · ${property.municipality}, ${property.department}`,
      images: [{ url: property.images[0], alt: property.imageAlt }],
      type: "website",
      locale: "es_CO",
      url: `/propiedades/${property.slug}`,
    },
    alternates: {
      canonical: `/propiedades/${property.slug}`,
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const agency = getAgencyById(property.agencyId);
  if (!agency) notFound();

  const whatsappUrl = createWhatsAppUrl(
    agency.whatsapp,
    `Hola, me interesa ${property.title} en ${property.municipality}. Vi la propiedad en Raíz de Pueblo: https://raizdepueblo.demo/propiedades/${property.slug}`,
  );
  const related = getRelatedProperties(property, properties);

  return (
    <>
      <JsonLd data={propertyJsonLd(property, agency)} />
      <div className="container-shell py-8 md:py-12">
        <Link
          href="/propiedades"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--forest)]"
        >
          <ArrowLeft aria-hidden="true" size={17} /> Volver al catálogo
        </Link>

        <div className="mt-7 grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <PropertyGallery images={property.images} alt={property.imageAlt} />

            <div className="mt-9">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-[#e8efe9] px-3 py-1.5 text-xs font-extrabold text-[var(--forest)]">
                  {formatPropertyType(property.propertyType)}
                </span>
                {property.featured && (
                  <span className="rounded-md bg-[#f3dfaa] px-3 py-1.5 text-xs font-extrabold text-[var(--forest)]">
                    Destacado
                  </span>
                )}
                {property.negotiable && (
                  <span className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--forest)]">
                    Precio negociable
                  </span>
                )}
              </div>
              <h1 className="mt-5 text-balance text-[clamp(2.7rem,6vw,5rem)] leading-[.96] text-[var(--forest)]">
                {property.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" size={18} />
                  {property.address ? `${property.address}, ` : ""}
                  {property.municipality}, {property.department}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden="true" size={18} />
                  Publicado el {formatPublishedDate(property.publishedAt)}
                </span>
              </div>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Precio</p>
                <p className="mt-2 text-xl font-extrabold text-[var(--forest)]">{formatPrice(property.price)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Área total</p>
                <p className="mt-2 inline-flex items-center gap-2 text-xl font-extrabold text-[var(--forest)]">
                  <Ruler aria-hidden="true" size={20} />
                  {formatArea(property.area, property.areaUnit)}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Acceso</p>
                <p className="mt-2 inline-flex items-start gap-2 text-sm font-bold leading-6 text-[var(--forest)]">
                  <Car aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
                  {property.roadAccess}
                </p>
              </div>
            </div>

            <section className="mt-12 border-t border-[var(--line)] pt-10">
              <p className="eyebrow">Acerca de la propiedad</p>
              <h2 className="mt-3 text-3xl text-[var(--forest)]">Una mirada completa antes de visitar</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
                {property.description}
              </p>
            </section>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <InfoList
                icon={Sparkles}
                title="Características principales"
                items={property.highlights}
              />
              <InfoList icon={Zap} title="Servicios disponibles" items={property.services} />
              <InfoList
                icon={Check}
                title="Usos recomendados"
                items={property.intendedUse}
              />
              <InfoList
                icon={FileText}
                title="Información legal disponible"
                items={
                  property.legalInfo.length
                    ? property.legalInfo
                    : ["Información no suministrada"]
                }
                note="Estos datos no equivalen a una verificación legal. Confírmalos con profesionales y autoridades competentes."
              />
            </div>

            <section className="mt-12 rounded-[1.6rem] border border-[var(--line)] bg-white p-6 sm:p-8">
              <div className="grid min-h-72 place-items-center rounded-2xl bg-[#e6ece7] bg-[radial-gradient(circle_at_30%_40%,#c9d9ce_0,transparent_28%),radial-gradient(circle_at_70%_65%,#d9c5a7_0,transparent_24%)] text-center">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-[var(--earth)] soft-shadow">
                    <MapPin aria-hidden="true" size={25} />
                  </span>
                  <h2 className="mt-5 text-2xl text-[var(--forest)]">Ubicación aproximada</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {property.municipality}, {property.department}
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-[var(--muted)]">
                    El mapa es un espacio demostrativo. Solicita la ubicación exacta
                    a la inmobiliaria antes de desplazarte.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 rounded-[1.6rem] bg-[#eee1cf] p-6 sm:p-8">
              <p className="eyebrow">Solicita más información</p>
              <h2 className="mt-3 text-3xl text-[var(--forest)]">Déjanos tus datos de contacto</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Prueba el flujo sin enviar información a terceros.
              </p>
              <div className="mt-7">
                <InquiryForm propertyTitle={property.title} />
              </div>
            </section>
          </div>

          <aside>
            <div className="sticky top-24 rounded-[1.5rem] border border-[var(--line)] bg-white p-6 soft-shadow">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--earth)]">Publicada por</p>
              <div className="mt-5 flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--forest)] font-serif text-xl font-bold text-white">
                  {agency.logo}
                </span>
                <div>
                  <h2 className="font-sans text-lg font-extrabold text-[var(--forest)]">{agency.name}</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {agency.municipality}, {agency.department}
                  </p>
                </div>
              </div>
              {agency.verified ? (
                <p className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#e8efe9] px-3 py-2 text-xs font-bold text-[var(--forest)]">
                  <BadgeCheck aria-hidden="true" size={17} />
                  Contacto confirmado · dato demostrativo
                </p>
              ) : (
                <p className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#f5eee5] px-3 py-2 text-xs font-bold text-[#7a5a45]">
                  <Info aria-hidden="true" size={17} />
                  Sin verificación documental
                </p>
              )}
              <p className="mt-5 text-sm leading-6 text-[var(--muted)]">{agency.description}</p>
              <div className="mt-6 grid gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1f8f55] font-bold text-white"
                  >
                    <MessageCircle aria-hidden="true" size={19} /> Contactar por WhatsApp
                  </a>
                )}
                <a
                  href={`mailto:${agency.email}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--line)] font-bold text-[var(--forest)]"
                >
                  <Mail aria-hidden="true" size={18} /> Enviar correo
                </a>
                <Link
                  href={`/inmobiliarias/${agency.slug}`}
                  className="text-center text-sm font-bold text-[var(--earth)] underline underline-offset-4"
                >
                  Ver perfil de la inmobiliaria
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section className="section-space border-t border-[var(--line)] bg-white">
        <div className="container-shell">
          <p className="eyebrow">Sigue explorando</p>
          <h2 className="section-title mt-3">Propiedades relacionadas</h2>
          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </div>
      </section>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="fixed inset-x-3 bottom-3 z-40 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#1f8f55] px-6 font-bold text-white shadow-2xl lg:hidden"
        >
          <MessageCircle aria-hidden="true" size={20} /> Contactar por WhatsApp
        </a>
      )}
    </>
  );
}

interface InfoListProps {
  icon: typeof Check;
  title: string;
  items: string[];
  note?: string;
}

function InfoList({ icon: Icon, title, items, note }: InfoListProps) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
      <span className="grid size-11 place-items-center rounded-full bg-[#edf2ee] text-[var(--forest)]">
        <Icon aria-hidden="true" size={21} />
      </span>
      <h2 className="mt-5 text-2xl text-[var(--forest)]">{title}</h2>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check aria-hidden="true" className="mt-1 shrink-0 text-[var(--earth)]" size={15} />
            {item}
          </li>
        ))}
      </ul>
      {note && <p className="mt-5 border-t border-[var(--line)] pt-4 text-xs leading-5 text-[var(--muted)]">{note}</p>}
    </section>
  );
}
