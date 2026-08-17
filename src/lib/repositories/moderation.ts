import "server-only";

import { randomUUID } from "node:crypto";
import type { Actor } from "@/lib/auth/authorization";
import {
  assertAgencyAccess,
  assertPlatformAdmin,
} from "@/lib/auth/authorization";
import { inTransaction, query } from "@/lib/db/pool";
import type { AgencyStatus } from "@/lib/repositories/agencies";
import type { PropertyStatus } from "@/lib/repositories/properties";

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}

export async function submitProperty(
  actor: Actor,
  propertyId: string,
): Promise<"pending_review" | "published"> {
  return inTransaction(async (client) => {
    const result = await client.query<{
      agency_id: string;
      property_status: PropertyStatus;
      agency_status: AgencyStatus;
      image_count: string;
    }>(
      `select
        p.agency_id,
        p.status as property_status,
        a.status as agency_status,
        (
          select count(*)::text
          from property_media pm
          where pm.property_id = p.id and pm.variant = 'display'
        ) as image_count
      from properties p
      join agencies a on a.id = p.agency_id
      where p.id = $1
      for update of p, a`,
      [propertyId],
    );
    const property = result.rows[0];
    if (!property) throw new WorkflowError("La propiedad no existe.");
    assertAgencyAccess(actor, property.agency_id);
    if (!["draft", "rejected"].includes(property.property_status)) {
      throw new WorkflowError("La propiedad no está lista para enviarse.");
    }
    if (Number(property.image_count) < 1) {
      throw new WorkflowError("La propiedad debe tener al menos una imagen.");
    }
    if (property.agency_status === "suspended") {
      throw new WorkflowError("La inmobiliaria está suspendida y no puede publicar.");
    }

    const nextStatus =
      property.agency_status === "verified" ? "published" : "pending_review";
    await client.query(
      `update properties set
        status = $2,
        rejection_reason = null,
        published_at = case
          when $2 = 'published' then current_timestamp
          else published_at
        end,
        updated_at = current_timestamp
      where id = $1`,
      [propertyId, nextStatus],
    );
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'property', $4, $5, $6::jsonb)`,
      [
        randomUUID(),
        actor.userId,
        property.agency_id,
        propertyId,
        nextStatus === "published"
          ? "property.auto_published"
          : "property.submitted_for_review",
        JSON.stringify({ agencyStatus: property.agency_status }),
      ],
    );
    return nextStatus;
  });
}

export async function setAgencyStatus(
  actor: Actor,
  agencyId: string,
  status: AgencyStatus,
): Promise<void> {
  assertPlatformAdmin(actor);

  await inTransaction(async (client) => {
    const result = await client.query<{ status: AgencyStatus }>(
      `update agencies
       set status = $2, updated_at = current_timestamp
       where id = $1
       returning status`,
      [agencyId, status],
    );
    if (!result.rowCount) throw new WorkflowError("La inmobiliaria no existe.");

    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'agency', $3, 'agency.status_changed', $4::jsonb)`,
      [randomUUID(), actor.userId, agencyId, JSON.stringify({ status })],
    );
  });
}

export async function moderateProperty(
  actor: Actor,
  propertyId: string,
  decision: "approve" | "reject",
  reason?: string,
): Promise<void> {
  assertPlatformAdmin(actor);
  if (decision === "reject" && (!reason || reason.trim().length < 10)) {
    throw new WorkflowError("El rechazo requiere una razón de al menos 10 caracteres.");
  }

  await inTransaction(async (client) => {
    const property = await client.query<{
      agency_id: string;
      status: PropertyStatus;
    }>(
      "select agency_id, status from properties where id = $1 for update",
      [propertyId],
    );
    const row = property.rows[0];
    if (!row) throw new WorkflowError("La propiedad no existe.");
    if (row.status !== "pending_review") {
      throw new WorkflowError("Solo se moderan propiedades pendientes de revisión.");
    }

    const nextStatus = decision === "approve" ? "published" : "rejected";
    await client.query(
      `update properties set
        status = $2,
        rejection_reason = $3,
        published_at = case
          when $2 = 'published' then current_timestamp
          else published_at
        end,
        updated_at = current_timestamp
      where id = $1`,
      [
        propertyId,
        nextStatus,
        decision === "reject" ? reason!.trim() : null,
      ],
    );
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'property', $4, $5, $6::jsonb)`,
      [
        randomUUID(),
        actor.userId,
        row.agency_id,
        propertyId,
        decision === "approve" ? "property.approved" : "property.rejected",
        JSON.stringify(decision === "reject" ? { reason: reason!.trim() } : {}),
      ],
    );
  });
}

export interface ModerationItem {
  id: string;
  title: string;
  agencyId: string;
  agencyName: string;
  municipality: string;
  submittedAt: string;
}

export async function listModerationQueue(actor: Actor): Promise<ModerationItem[]> {
  assertPlatformAdmin(actor);
  const result = await query<{
    id: string;
    title: string;
    agency_id: string;
    agency_name: string;
    municipality: string;
    updated_at: Date;
  }>(
    `select
      p.id, p.title, p.agency_id, a.name as agency_name,
      p.municipality, p.updated_at
    from properties p
    join agencies a on a.id = p.agency_id
    where p.status = 'pending_review'
    order by p.updated_at`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    municipality: row.municipality,
    submittedAt: row.updated_at.toISOString(),
  }));
}

export interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  agencyId: string | null;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function listRecentAuditEvents(
  actor: Actor,
  limit = 30,
): Promise<AuditEvent[]> {
  assertPlatformAdmin(actor);
  const result = await query<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    agency_id: string | null;
    actor_user_id: string | null;
    metadata: Record<string, unknown>;
    created_at: Date;
  }>(
    `select
      id, action, entity_type, entity_id, agency_id, actor_user_id,
      metadata, created_at
    from audit_events
    order by created_at desc
    limit $1`,
    [Math.min(Math.max(limit, 1), 100)],
  );
  return result.rows.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    agencyId: row.agency_id,
    actorUserId: row.actor_user_id,
    metadata: row.metadata,
    createdAt: row.created_at.toISOString(),
  }));
}
