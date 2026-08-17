import "server-only";

import { query } from "@/lib/db/pool";
import type { Agency, Property } from "@/types";

interface PublicPropertyRow {
  id: string;
  agency_id: string;
  agency_name: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  currency: "COP";
  property_type: Property["propertyType"];
  department: string;
  municipality: string;
  address: string | null;
  area: string;
  area_unit: Property["areaUnit"];
  intended_use: string[];
  services: string[];
  road_access: string;
  image_alt: string;
  featured: boolean;
  negotiable: boolean;
  published_at: Date;
  highlights: string[];
  legal_info: string[];
  latitude: number | null;
  longitude: number | null;
  images: string[];
}

const publicPropertySelect = `
  select
    p.id, p.agency_id, a.name as agency_name, p.slug, p.title, p.description,
    p.price::text, p.currency, p.property_type, p.department, p.municipality,
    p.address, p.area::text, p.area_unit, p.intended_use, p.services,
    p.road_access, p.image_alt, p.featured, p.negotiable, p.published_at,
    p.highlights, p.legal_info, p.latitude, p.longitude,
    coalesce(
      array_agg('/media/' || pm.id order by pm.position)
        filter (where pm.variant = 'display'),
      '{}'
    ) as images
  from properties p
  join agencies a on a.id = p.agency_id
  left join property_media pm on pm.property_id = p.id
`;

function mapProperty(row: PublicPropertyRow): Property {
  return {
    id: row.id,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    propertyType: row.property_type,
    department: row.department,
    municipality: row.municipality,
    address: row.address ?? undefined,
    area: Number(row.area),
    areaUnit: row.area_unit,
    intendedUse: row.intended_use,
    services: row.services,
    roadAccess: row.road_access,
    images: row.images,
    imageAlt: row.image_alt,
    featured: row.featured,
    negotiable: row.negotiable,
    publishedAt: row.published_at.toISOString(),
    highlights: row.highlights,
    legalInfo: row.legal_info,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

export async function listPublishedProperties(): Promise<Property[]> {
  const result = await query<PublicPropertyRow>(
    `${publicPropertySelect}
     where p.status = 'published'
     group by p.id, a.name
     order by p.featured desc, p.published_at desc`,
  );
  return result.rows.map(mapProperty);
}

export async function getPublishedPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  const result = await query<PublicPropertyRow>(
    `${publicPropertySelect}
     where p.status = 'published' and p.slug = $1
     group by p.id, a.name`,
    [slug],
  );
  return result.rows[0] ? mapProperty(result.rows[0]) : null;
}

interface PublicAgencyRow {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  department: string;
  municipality: string;
  phone: string;
  whatsapp: string;
  email: string;
  status: "pending" | "verified" | "suspended";
}

function mapAgency(row: PublicAgencyRow): Agency {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo,
    description: row.description,
    department: row.department,
    municipality: row.municipality,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    verified: row.status === "verified",
  };
}

export async function listPublicAgencies(): Promise<Agency[]> {
  const result = await query<PublicAgencyRow>(
    `select
      a.id, a.name, a.slug, a.logo, a.description, a.department,
      a.municipality, a.phone, a.whatsapp, a.email, a.status
    from agencies a
    where exists (
      select 1 from properties p
      where p.agency_id = a.id and p.status = 'published'
    )
    order by a.name`,
  );
  return result.rows.map(mapAgency);
}

export async function getPublicAgencyById(id: string): Promise<Agency | null> {
  const result = await query<PublicAgencyRow>(
    `select
      id, name, slug, logo, description, department, municipality,
      phone, whatsapp, email, status
    from agencies
    where id = $1 and status <> 'suspended'`,
    [id],
  );
  return result.rows[0] ? mapAgency(result.rows[0]) : null;
}

export async function getPublicAgencyBySlug(
  slug: string,
): Promise<Agency | null> {
  const result = await query<PublicAgencyRow>(
    `select
      id, name, slug, logo, description, department, municipality,
      phone, whatsapp, email, status
    from agencies
    where slug = $1 and status <> 'suspended'`,
    [slug],
  );
  return result.rows[0] ? mapAgency(result.rows[0]) : null;
}
