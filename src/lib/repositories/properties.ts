import "server-only";

import { randomUUID } from "node:crypto";
import type { Actor } from "@/lib/auth/authorization";
import { assertAgencyAccess } from "@/lib/auth/authorization";
import { inTransaction, query } from "@/lib/db/pool";
import type { SerializedImageVariant } from "@/lib/media/serialize-image";
import type { PropertyInput } from "@/lib/validation/property";

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export interface ManagedProperty {
  id: string;
  agencyId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  propertyType: "lote" | "finca" | "terreno-rural" | "terreno-urbano";
  department: string;
  municipality: string;
  address: string;
  area: number;
  areaUnit: "m2" | "hectareas";
  intendedUse: string[];
  services: string[];
  roadAccess: string;
  imageAlt: string;
  highlights: string[];
  legalInfo: string[];
  negotiable: boolean;
  status: PropertyStatus;
  rejectionReason: string | null;
  imageCount: number;
  updatedAt: string;
}

interface PropertyRow {
  id: string;
  agency_id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  property_type: ManagedProperty["propertyType"];
  department: string;
  municipality: string;
  address: string | null;
  area: string;
  area_unit: ManagedProperty["areaUnit"];
  intended_use: string[];
  services: string[];
  road_access: string;
  image_alt: string;
  highlights: string[];
  legal_info: string[];
  negotiable: boolean;
  status: PropertyStatus;
  rejection_reason: string | null;
  image_count: string;
  updated_at: Date;
}

function mapProperty(row: PropertyRow): ManagedProperty {
  return {
    id: row.id,
    agencyId: row.agency_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    propertyType: row.property_type,
    department: row.department,
    municipality: row.municipality,
    address: row.address ?? "",
    area: Number(row.area),
    areaUnit: row.area_unit,
    intendedUse: row.intended_use,
    services: row.services,
    roadAccess: row.road_access,
    imageAlt: row.image_alt,
    highlights: row.highlights,
    legalInfo: row.legal_info,
    negotiable: row.negotiable,
    status: row.status,
    rejectionReason: row.rejection_reason,
    imageCount: Number(row.image_count),
    updatedAt: row.updated_at.toISOString(),
  };
}

const propertySelect = `
  select
    p.id, p.agency_id, p.slug, p.title, p.description, p.price::text,
    p.property_type, p.department, p.municipality, p.address, p.area::text,
    p.area_unit, p.intended_use, p.services, p.road_access, p.image_alt,
    p.highlights, p.legal_info, p.negotiable, p.status, p.rejection_reason,
    p.updated_at,
    count(pm.id) filter (where pm.variant = 'display')::text as image_count
  from properties p
  left join property_media pm on pm.property_id = p.id
`;

export async function listManagedProperties(
  actor: Actor,
  agencyId: string,
): Promise<ManagedProperty[]> {
  assertAgencyAccess(actor, agencyId);
  const result = await query<PropertyRow>(
    `${propertySelect}
     where p.agency_id = $1
     group by p.id
     order by p.updated_at desc`,
    [agencyId],
  );
  return result.rows.map(mapProperty);
}

export async function getManagedProperty(
  actor: Actor,
  propertyId: string,
): Promise<ManagedProperty | null> {
  const result = await query<PropertyRow>(
    `${propertySelect}
     where p.id = $1
     group by p.id`,
    [propertyId],
  );
  const property = result.rows[0] ? mapProperty(result.rows[0]) : null;
  if (property) assertAgencyAccess(actor, property.agencyId);
  return property;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

async function uniqueSlug(
  client: import("pg").PoolClient,
  title: string,
  municipality: string,
  propertyId?: string,
): Promise<string> {
  const base = slugify(`${title}-${municipality}`) || randomUUID();
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix ? `${base}-${suffix + 1}` : base;
    const exists = await client.query(
      "select 1 from properties where slug = $1 and id <> coalesce($2, '')",
      [candidate, propertyId ?? null],
    );
    if (!exists.rowCount) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

async function insertMedia(
  client: import("pg").PoolClient,
  propertyId: string,
  images: SerializedImageVariant[],
) {
  for (const image of images) {
    await client.query(
      `insert into property_media (
        id, property_id, variant, position, mime_type, width, height,
        byte_size, sha256, content
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        image.id,
        propertyId,
        image.variant,
        image.position,
        image.mimeType,
        image.width,
        image.height,
        image.byteSize,
        image.sha256,
        image.content,
      ],
    );
  }
}

export async function createProperty(
  actor: Actor,
  input: PropertyInput,
  images: SerializedImageVariant[],
): Promise<string> {
  assertAgencyAccess(actor, input.agencyId);
  if (!images.length) throw new Error("Debes cargar al menos una imagen.");
  const propertyId = randomUUID();

  return inTransaction(async (client) => {
    const slug = await uniqueSlug(client, input.title, input.municipality);
    await client.query(
      `insert into properties (
        id, agency_id, slug, title, description, price, property_type,
        department, municipality, address, area, area_unit, intended_use,
        services, road_access, image_alt, highlights, legal_info, negotiable
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, nullif($10, ''), $11, $12,
        $13, $14, $15, $16, $17, $18, $19
      )`,
      [
        propertyId,
        input.agencyId,
        slug,
        input.title,
        input.description,
        input.price,
        input.propertyType,
        input.department,
        input.municipality,
        input.address ?? "",
        input.area,
        input.areaUnit,
        input.intendedUse,
        input.services,
        input.roadAccess,
        input.imageAlt,
        input.highlights,
        input.legalInfo,
        input.negotiable,
      ],
    );
    await insertMedia(client, propertyId, images);
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'property', $4, 'property.created', $5::jsonb)`,
      [
        randomUUID(),
        actor.userId,
        input.agencyId,
        propertyId,
        JSON.stringify({ imageVariants: images.length }),
      ],
    );
    return propertyId;
  });
}

export async function updateProperty(
  actor: Actor,
  input: PropertyInput & { propertyId: string },
  images: SerializedImageVariant[],
): Promise<void> {
  const current = await getManagedProperty(actor, input.propertyId);
  if (!current) throw new Error("La propiedad no existe.");
  if (current.agencyId !== input.agencyId) {
    throw new Error("La propiedad no pertenece a la inmobiliaria indicada.");
  }

  await inTransaction(async (client) => {
    const slug = await uniqueSlug(
      client,
      input.title,
      input.municipality,
      input.propertyId,
    );
    await client.query(
      `update properties set
        slug = $2, title = $3, description = $4, price = $5,
        property_type = $6, department = $7, municipality = $8,
        address = nullif($9, ''), area = $10, area_unit = $11,
        intended_use = $12, services = $13, road_access = $14,
        image_alt = $15, highlights = $16, legal_info = $17,
        negotiable = $18, status = case
          when status in ('published', 'pending_review') then 'draft'
          else status
        end,
        rejection_reason = null,
        updated_at = current_timestamp
      where id = $1`,
      [
        input.propertyId,
        slug,
        input.title,
        input.description,
        input.price,
        input.propertyType,
        input.department,
        input.municipality,
        input.address ?? "",
        input.area,
        input.areaUnit,
        input.intendedUse,
        input.services,
        input.roadAccess,
        input.imageAlt,
        input.highlights,
        input.legalInfo,
        input.negotiable,
      ],
    );
    await insertMedia(client, input.propertyId, images);
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'property', $4, 'property.updated', $5::jsonb)`,
      [
        randomUUID(),
        actor.userId,
        input.agencyId,
        input.propertyId,
        JSON.stringify({ imageVariantsAdded: images.length }),
      ],
    );
  });
}

export async function archiveProperty(
  actor: Actor,
  propertyId: string,
): Promise<void> {
  const property = await getManagedProperty(actor, propertyId);
  if (!property) throw new Error("La propiedad no existe.");

  await inTransaction(async (client) => {
    await client.query(
      `update properties
       set status = 'archived', updated_at = current_timestamp
       where id = $1`,
      [propertyId],
    );
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action
      ) values ($1, $2, $3, 'property', $4, 'property.archived')`,
      [randomUUID(), actor.userId, property.agencyId, propertyId],
    );
  });
}
