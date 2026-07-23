import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/types";
import { getAgencyById } from "@/data/agencies";
import { formatArea, formatPrice, formatPropertyType } from "@/lib/format";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const agency = getAgencyById(property.agencyId);

  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-black/5 bg-white soft-shadow">
      <Link href={`/propiedades/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {property.featured && (
            <span className="rounded-md bg-[var(--gold)] px-2.5 py-1 text-xs font-extrabold text-[var(--forest)]">
              Destacado
            </span>
          )}
          {property.negotiable && (
            <span className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-[var(--forest)]">
              Negociable
            </span>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--earth)]">
              {formatPropertyType(property.propertyType)}
            </p>
            <h3 className="mt-1 text-xl leading-tight text-[var(--forest)]">
              <Link href={`/propiedades/${property.slug}`}>{property.title}</Link>
            </h3>
          </div>
          <Link
            href={`/propiedades/${property.slug}`}
            aria-label={`Ver ${property.title}`}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--forest)] transition group-hover:bg-[var(--forest)] group-hover:text-white"
          >
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" size={16} />
            {property.municipality}, {property.department}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ruler aria-hidden="true" size={16} />
            {formatArea(property.area, property.areaUnit)}
          </span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--line)] pt-4">
          <div>
            <p className="text-xs text-[var(--muted)]">Precio desde</p>
            <p className="text-lg font-extrabold text-[var(--forest)]">
              {formatPrice(property.price)}
            </p>
          </div>
          <p className="max-w-[130px] text-right text-xs leading-5 text-[var(--muted)]">
            {agency?.name}
          </p>
        </div>
      </div>
    </article>
  );
}
