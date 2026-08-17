import "server-only";

import type { Actor } from "@/lib/auth/actor";
import { assertAgencyAccess } from "@/lib/auth/actor";
import { inTransaction, query } from "@/lib/db/pool";
import type { AgencyProfileInput } from "@/lib/validation/agency";
import { randomUUID } from "node:crypto";

export type AgencyStatus = "pending" | "verified" | "suspended";

export interface ManagedAgency {
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
  status: AgencyStatus;
  propertyCount: number;
}

interface AgencyRow {
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
  status: AgencyStatus;
  property_count: string;
}

function mapAgency(row: AgencyRow): ManagedAgency {
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
    status: row.status,
    propertyCount: Number(row.property_count),
  };
}

export async function listAgenciesForActor(actor: Actor): Promise<ManagedAgency[]> {
  const values: unknown[] = [];
  const scope = actor.platformAdmin
    ? ""
    : "where a.id = any($1::text[])";

  if (!actor.platformAdmin) values.push(actor.agencyIds);

  const result = await query<AgencyRow>(
    `select
      a.id, a.name, a.slug, a.logo, a.description, a.department,
      a.municipality, a.phone, a.whatsapp, a.email, a.status,
      count(p.id)::text as property_count
    from agencies a
    left join properties p on p.agency_id = a.id
    ${scope}
    group by a.id
    order by a.name`,
    values,
  );

  return result.rows.map(mapAgency);
}

export async function getAgencyForActor(
  actor: Actor,
  agencyId: string,
): Promise<ManagedAgency | null> {
  assertAgencyAccess(actor, agencyId);
  const result = await query<AgencyRow>(
    `select
      a.id, a.name, a.slug, a.logo, a.description, a.department,
      a.municipality, a.phone, a.whatsapp, a.email, a.status,
      count(p.id)::text as property_count
    from agencies a
    left join properties p on p.agency_id = a.id
    where a.id = $1
    group by a.id`,
    [agencyId],
  );

  return result.rows[0] ? mapAgency(result.rows[0]) : null;
}

export async function updateAgencyProfile(
  actor: Actor,
  input: AgencyProfileInput,
): Promise<void> {
  assertAgencyAccess(actor, input.agencyId);

  await inTransaction(async (client) => {
    const updated = await client.query(
      `update agencies set
        name = $2,
        description = $3,
        department = $4,
        municipality = $5,
        phone = $6,
        whatsapp = $7,
        email = $8,
        updated_at = current_timestamp
      where id = $1`,
      [
        input.agencyId,
        input.name,
        input.description,
        input.department,
        input.municipality,
        input.phone,
        input.whatsapp,
        input.email,
      ],
    );

    if (updated.rowCount !== 1) {
      throw new Error("La inmobiliaria no existe.");
    }

    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'agency', $3, 'agency.profile_updated', $4::jsonb)`,
      [
        randomUUID(),
        actor.userId,
        input.agencyId,
        JSON.stringify({
          fields: [
            "name",
            "description",
            "department",
            "municipality",
            "phone",
            "whatsapp",
            "email",
          ],
        }),
      ],
    );
  });
}
