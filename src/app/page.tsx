import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Headphones,
  Map,
  MessageCircle,
  Search,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { HomeSearch } from "@/components/home/home-search";
import { PropertyCard } from "@/components/properties/property-card";
import { properties } from "@/data/properties";

const popularMunicipalities = [
  { name: "Villa de Leyva", department: "Boyacá", image: "/images/villa-de-leyva.jpg", count: 14 },
  { name: "Jericó", department: "Antioquia", image: "/images/jerico.jpg", count: 9 },
  { name: "Salento", department: "Quindío", image: "/images/manizales.jpg", count: 11 },
  { name: "Palomino", department: "La Guajira", image: "/images/palomino.jpg", count: 7 },
];

const steps = [
  {
    icon: Search,
    title: "Explora a tu ritmo",
    text: "Filtra por municipio, precio, área o uso del terreno sin perderte entre opciones irrelevantes.",
  },
  {
    icon: Map,
    title: "Entiende el lugar",
    text: "Revisa acceso, servicios, contexto y características antes de iniciar una conversación.",
  },
  {
    icon: MessageCircle,
    title: "Habla con el vendedor",
    text: "Contacta directamente a la inmobiliaria local por WhatsApp, sin intermediarios adicionales.",
  },
];

export default function HomePage() {
  const featuredProperties = properties.filter((property) => property.featured).slice(0, 3);

  return (
    <>
      <section className="relative min-h-[760px] overflow-hidden bg-[var(--forest)] text-white">
        <Image
          src="/images/hero.jpg"
          alt="Paisaje rural montañoso en Huila, Colombia"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="image-overlay absolute inset-0" />
        <div className="container-shell relative z-10 flex min-h-[760px] items-end py-16 md:items-center md:py-24">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.17em] text-[#f2cf84]">
              <Sprout aria-hidden="true" size={18} />
              Colombia se descubre desde sus pueblos
            </p>
            <h1 className="text-balance max-w-4xl text-[clamp(3rem,7vw,6.6rem)] leading-[0.92]">
              Encuentra terrenos con potencial en los pueblos de Colombia
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Lotes, fincas y terrenos presentados por inmobiliarias que conocen
              el territorio, sus caminos y sus oportunidades.
            </p>
            <div className="mt-9 max-w-4xl">
              <HomeSearch />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden="true" size={17} /> Contacto directo
              </span>
              <span className="inline-flex items-center gap-2">
                <Map aria-hidden="true" size={17} /> Información localizada
              </span>
              <span className="inline-flex items-center gap-2">
                <Headphones aria-hidden="true" size={17} /> Acompañamiento cercano
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-[#efe5d4] py-4">
        <div className="container-shell flex flex-col gap-2 text-sm text-[var(--forest)] sm:flex-row sm:items-center sm:justify-between">
          <strong>Contenido demostrativo</strong>
          <span>Las ofertas y agencias son ficticias; valida siempre la información antes de negociar.</span>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Una selección con carácter</p>
              <h2 className="section-title mt-3">Propiedades que vale la pena mirar con calma</h2>
            </div>
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 font-bold text-[var(--forest)] underline decoration-[var(--gold)] decoration-2 underline-offset-8"
            >
              Ver todo el catálogo <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section id="municipios" className="section-space bg-[var(--forest)] text-white">
        <div className="container-shell">
          <p className="eyebrow !text-[#e8c983]">Destinos con historia</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="section-title !text-white">Municipios para imaginar una vida distinta</h2>
            <p className="max-w-md text-sm leading-6 text-white/65">
              Explora paisajes, climas y oportunidades diversas sin perder el
              contexto local.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularMunicipalities.map((municipality) => (
              <Link
                key={municipality.name}
                href={`/propiedades?municipio=${encodeURIComponent(municipality.name)}`}
                className="group relative min-h-80 overflow-hidden rounded-[1.4rem]"
              >
                <Image
                  src={municipality.image}
                  alt={`Paisaje de ${municipality.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#e8c983]">
                    {municipality.department}
                  </p>
                  <h3 className="mt-1 text-2xl">{municipality.name}</h3>
                  <p className="mt-1 text-sm text-white/70">{municipality.count} oportunidades</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section-space bg-white">
        <div className="container-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Claro desde el primer paso</p>
            <h2 className="section-title mt-3">Menos ruido, más contexto para decidir</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="border-t border-[var(--line)] pt-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-full bg-[#e8efe9] text-[var(--forest)]">
                    <step.icon aria-hidden="true" size={22} />
                  </span>
                  <span className="font-serif text-4xl text-[var(--sand)]">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl text-[var(--forest)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="inmobiliarias" className="section-space">
        <div className="container-shell">
          <div className="overflow-hidden rounded-[2rem] bg-[#e8d7bd]">
            <div className="grid lg:grid-cols-[1.1fr_.9fr]">
              <div className="p-8 sm:p-12 lg:p-16">
                <p className="eyebrow">Para inmobiliarias locales</p>
                <h2 className="section-title mt-3">Tu conocimiento del territorio merece más alcance</h2>
                <p className="mt-6 max-w-xl leading-7 text-[var(--muted)]">
                  Presenta cada propiedad con fotos, datos claros y una historia
                  que ayude a compradores de otras regiones a entender su potencial.
                </p>
                <a
                  href="mailto:hola@raizdepueblo.demo?subject=Quiero publicar propiedades"
                  className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--forest)] px-6 font-bold text-white"
                >
                  Quiero publicar <ArrowRight aria-hidden="true" size={18} />
                </a>
              </div>
              <div className="relative min-h-80">
                <Image
                  src="/images/guayabal.jpg"
                  alt="Cultivos y montañas de una zona rural colombiana"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space border-t border-[var(--line)] bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Confianza sin exageraciones</p>
            <h2 className="section-title mt-3">Información clara antes de dar el siguiente paso</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              [Building2, "3", "inmobiliarias locales en esta demostración"],
              [BadgeCheck, "8", "propiedades con información estructurada"],
              [MessageCircle, "1:1", "contacto directo con cada agencia"],
            ].map(([Icon, value, label]) => {
              const TrustIcon = Icon as typeof Building2;
              return (
                <div key={String(label)} className="rounded-2xl border border-[var(--line)] p-5">
                  <TrustIcon aria-hidden="true" className="text-[var(--earth)]" size={23} />
                  <p className="mt-7 font-serif text-4xl text-[var(--forest)]">{String(value)}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{String(label)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
