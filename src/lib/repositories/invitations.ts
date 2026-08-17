import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { Actor } from "@/lib/auth/authorization";
import { assertPlatformAdmin } from "@/lib/auth/authorization";
import { enqueueEmail } from "@/lib/email/outbox";
import { invitationEmail } from "@/lib/email/templates";
import { inTransaction, query } from "@/lib/db/pool";
import type { CreateInvitationInput } from "@/lib/validation/invitation";

export class InvitationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationError";
  }
}

export type InvitationState = "pending" | "accepted" | "revoked" | "expired";

export interface InvitationView {
  id: string;
  agencyId: string;
  agencyName: string;
  email: string;
  role: "owner" | "editor";
  state: InvitationState;
  existingUserId: string | null;
  expiresAt: string;
  createdAt: string;
}

interface InvitationRow {
  id: string;
  agency_id: string;
  agency_name: string;
  email: string;
  role: "owner" | "editor";
  status: "pending" | "accepted" | "revoked";
  existing_user_id: string | null;
  expires_at: Date;
  created_at: Date;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function stateOf(row: InvitationRow): InvitationState {
  if (row.status === "pending" && row.expires_at <= new Date()) return "expired";
  return row.status;
}

function mapInvitation(row: InvitationRow): InvitationView {
  return {
    id: row.id,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    email: row.email,
    role: row.role,
    state: stateOf(row),
    existingUserId: row.existing_user_id,
    expiresAt: row.expires_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

const invitationSelect = `
  select
    i.id, i.agency_id, a.name as agency_name, i.email, i.role, i.status,
    u.id as existing_user_id, i.expires_at, i.created_at
  from invitations i
  join agencies a on a.id = i.agency_id
  left join "user" u on lower(u.email) = i.email
`;

export async function createInvitation(
  actor: Actor,
  input: CreateInvitationInput,
): Promise<{ invitationId: string; outboxId: string }> {
  assertPlatformAdmin(actor);
  const email = input.email.trim().toLowerCase();
  const rawToken = randomBytes(32).toString("base64url");
  const invitationId = randomUUID();
  const baseUrl = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000",
  );
  const invitationUrl = new URL("/aceptar-invitacion", baseUrl);
  invitationUrl.searchParams.set("token", rawToken);

  return inTransaction(async (client) => {
    await client.query(
      `update invitations
       set status = 'revoked', revoked_at = current_timestamp,
           updated_at = current_timestamp
       where agency_id = $1 and email = $2
         and status = 'pending' and expires_at <= current_timestamp`,
      [input.agencyId, email],
    );
    const agency = await client.query<{ name: string }>(
      "select name from agencies where id = $1",
      [input.agencyId],
    );
    if (!agency.rows[0]) {
      throw new InvitationError("La inmobiliaria no existe.");
    }
    const membership = await client.query(
      `select 1
       from agency_members am
       join "user" u on u.id = am.user_id
       where am.agency_id = $1 and lower(u.email) = $2`,
      [input.agencyId, email],
    );
    if (membership.rowCount) {
      throw new InvitationError("Ese correo ya pertenece a la inmobiliaria.");
    }
    const existing = await client.query(
      `select 1 from invitations
       where agency_id = $1 and email = $2 and status = 'pending'`,
      [input.agencyId, email],
    );
    if (existing.rowCount) {
      throw new InvitationError("Ya existe una invitación pendiente para ese correo.");
    }

    await client.query(
      `insert into invitations (
        id, agency_id, email, role, token_hash, invited_by_user_id, expires_at
      ) values ($1, $2, $3, $4, $5, $6, current_timestamp + interval '7 days')`,
      [
        invitationId,
        input.agencyId,
        email,
        input.role,
        tokenHash(rawToken),
        actor.userId,
      ],
    );
    const message = invitationEmail({
      agencyName: agency.rows[0].name,
      role: input.role,
      url: invitationUrl.toString(),
    });
    const outboxId = await enqueueEmail(client, {
      kind: "invitation",
      recipient: email,
      ...message,
    });
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
      ) values ($1, $2, $3, 'invitation', $4, 'invitation.created', $5::jsonb)`,
      [
        randomUUID(),
        actor.userId,
        input.agencyId,
        invitationId,
        JSON.stringify({ email, role: input.role }),
      ],
    );
    return { invitationId, outboxId };
  });
}

export async function getInvitationByToken(
  token: string,
): Promise<InvitationView | null> {
  if (token.length < 32 || token.length > 512) return null;
  const result = await query<InvitationRow>(
    `${invitationSelect} where i.token_hash = $1`,
    [tokenHash(token)],
  );
  return result.rows[0] ? mapInvitation(result.rows[0]) : null;
}

export async function listInvitations(actor: Actor): Promise<InvitationView[]> {
  assertPlatformAdmin(actor);
  const result = await query<InvitationRow>(
    `${invitationSelect} order by i.created_at desc limit 100`,
  );
  return result.rows.map(mapInvitation);
}

async function lockedInvitation(
  client: PoolClient,
  token: string,
): Promise<InvitationRow> {
  const result = await client.query<InvitationRow>(
    `${invitationSelect}
     where i.token_hash = $1
     for update of i`,
    [tokenHash(token)],
  );
  const row = result.rows[0];
  if (!row || stateOf(row) !== "pending") {
    throw new InvitationError("La invitación no existe, venció o ya fue utilizada.");
  }
  return row;
}

async function completeMembership(
  client: PoolClient,
  invitation: InvitationRow,
  userId: string,
): Promise<void> {
  await client.query(
    `insert into agency_members (agency_id, user_id, role)
     values ($1, $2, $3)
     on conflict (agency_id, user_id) do nothing`,
    [invitation.agency_id, userId, invitation.role],
  );
  const accepted = await client.query(
    `update invitations
     set status = 'accepted', accepted_by_user_id = $2,
         accepted_at = current_timestamp, updated_at = current_timestamp
     where id = $1 and status = 'pending' and expires_at > current_timestamp`,
    [invitation.id, userId],
  );
  if (accepted.rowCount !== 1) {
    throw new InvitationError("La invitación dejó de estar disponible.");
  }
  await client.query(
    `insert into audit_events (
      id, actor_user_id, agency_id, entity_type, entity_id, action, metadata
    ) values ($1, $2, $3, 'invitation', $4, 'invitation.accepted', $5::jsonb)`,
    [
      randomUUID(),
      userId,
      invitation.agency_id,
      invitation.id,
      JSON.stringify({ role: invitation.role }),
    ],
  );
}

export async function acceptNewInvitation(
  token: string,
  createAccount: (email: string) => Promise<string>,
): Promise<void> {
  let createdUserId: string | null = null;
  try {
    await inTransaction(async (client) => {
      const invitation = await lockedInvitation(client, token);
      if (invitation.existing_user_id) {
        throw new InvitationError(
          "Este correo ya tiene cuenta. Ingresa para aceptar la invitación.",
        );
      }
      createdUserId = await createAccount(invitation.email);
      await client.query(
        `update "user"
         set "emailVerified" = true, "updatedAt" = current_timestamp
         where id = $1 and lower(email) = $2`,
        [createdUserId, invitation.email],
      );
      await completeMembership(client, invitation, createdUserId);
    });
  } catch (error) {
    if (createdUserId) {
      await query(
        `delete from "user" u
         where u.id = $1
           and not exists (
             select 1 from agency_members am where am.user_id = u.id
           )`,
        [createdUserId],
      );
    }
    throw error;
  }
}

export async function acceptExistingInvitation(
  actor: Actor,
  token: string,
): Promise<void> {
  await inTransaction(async (client) => {
    const invitation = await lockedInvitation(client, token);
    if (actor.email.trim().toLowerCase() !== invitation.email) {
      throw new InvitationError(
        "La sesión actual no corresponde al correo invitado.",
      );
    }
    await completeMembership(client, invitation, actor.userId);
  });
}

export async function revokeInvitation(
  actor: Actor,
  invitationId: string,
): Promise<void> {
  assertPlatformAdmin(actor);
  await inTransaction(async (client) => {
    const result = await client.query<{ agency_id: string }>(
      `update invitations
       set status = 'revoked', revoked_at = current_timestamp,
           updated_at = current_timestamp
       where id = $1 and status = 'pending'
       returning agency_id`,
      [invitationId],
    );
    if (!result.rows[0]) {
      throw new InvitationError("La invitación ya no puede revocarse.");
    }
    await client.query(
      `insert into audit_events (
        id, actor_user_id, agency_id, entity_type, entity_id, action
      ) values ($1, $2, $3, 'invitation', $4, 'invitation.revoked')`,
      [randomUUID(), actor.userId, result.rows[0].agency_id, invitationId],
    );
  });
}

