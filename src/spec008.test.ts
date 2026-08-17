// @vitest-environment node

import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import type { Actor } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization";
import {
  moderateProperty,
  setAgencyStatus,
  submitProperty,
  WorkflowError,
} from "@/lib/repositories/moderation";
import type { AgencyStatus } from "@/lib/repositories/agencies";

const admin: Actor = {
  userId: "user-platform-admin",
  email: "admin@raizdepueblo.local",
  name: "Administrador local",
  platformAdmin: true,
  agencyIds: [],
};

const runDatabaseTests = process.env.RUN_DB_TESTS === "1";
const databasePool = runDatabaseTests
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;
const cleanupAgencies: string[] = [];
const cleanupProperties: string[] = [];

async function createScenario(status: AgencyStatus) {
  const agencyId = `test-agency-${randomUUID()}`;
  const propertyId = `test-property-${randomUUID()}`;
  cleanupAgencies.push(agencyId);
  cleanupProperties.push(propertyId);

  await databasePool!.query(
    `insert into agencies (
      id, name, slug, logo, description, department, municipality,
      phone, whatsapp, email, status
    ) values ($1, $2, $3, 'TP', $4, 'Boyacá', 'Villa de Leyva',
      '+57 300 000 0000', '573000000000', $5, $6)`,
    [
      agencyId,
      `Agencia ${status}`,
      agencyId,
      "Agencia temporal creada para probar la máquina de estados de publicación.",
      `${agencyId}@example.test`,
      status,
    ],
  );
  await databasePool!.query(
    `insert into properties (
      id, agency_id, slug, title, description, price, property_type,
      department, municipality, area, area_unit, road_access, image_alt
    ) values (
      $1, $2, $3, 'Propiedad temporal', $4, 100000000, 'lote',
      'Boyacá', 'Villa de Leyva', 1000, 'm2', 'Acceso de prueba',
      'Imagen temporal para prueba'
    )`,
    [
      propertyId,
      agencyId,
      propertyId,
      "Propiedad temporal para verificar el flujo de confianza progresiva y moderación.",
    ],
  );
  await databasePool!.query(
    `insert into property_media (
      id, property_id, variant, position, mime_type, width, height,
      byte_size, sha256, content
    ) values (
      $1, $2, 'display', 0, 'image/webp', 1, 1, 1,
      $3, $4
    )`,
    [
      `media-${propertyId}`,
      propertyId,
      "0".repeat(64),
      Buffer.from([1]),
    ],
  );

  const actor: Actor = {
    userId: "user-agency-member",
    email: "agencia@raizdepueblo.local",
    name: "Gestor de inmobiliaria",
    platformAdmin: false,
    agencyIds: [agencyId],
  };
  return { agencyId, propertyId, actor };
}

describe.skipIf(!runDatabaseTests)("SPEC008 confianza progresiva", () => {
  afterAll(async () => {
    if (!databasePool) return;
    await databasePool.query(
      "delete from properties where id = any($1::text[])",
      [cleanupProperties],
    );
    await databasePool.query(
      "delete from agencies where id = any($1::text[])",
      [cleanupAgencies],
    );
    await databasePool.end();
  });

  it("envía agencias nuevas a revisión y permite aprobarlas", async () => {
    const scenario = await createScenario("pending");
    await expect(
      submitProperty(scenario.actor, scenario.propertyId),
    ).resolves.toBe("pending_review");

    await moderateProperty(admin, scenario.propertyId, "approve");
    const result = await databasePool!.query(
      "select status, published_at from properties where id = $1",
      [scenario.propertyId],
    );
    expect(result.rows[0].status).toBe("published");
    expect(result.rows[0].published_at).toBeInstanceOf(Date);
  });

  it("publica directamente para agencias verificadas", async () => {
    const scenario = await createScenario("verified");
    await expect(
      submitProperty(scenario.actor, scenario.propertyId),
    ).resolves.toBe("published");
  });

  it("bloquea agencias suspendidas", async () => {
    const scenario = await createScenario("suspended");
    await expect(
      submitProperty(scenario.actor, scenario.propertyId),
    ).rejects.toEqual(
      new WorkflowError("La inmobiliaria está suspendida y no puede publicar."),
    );
  });

  it("exige administrador y razón suficiente para rechazar", async () => {
    const scenario = await createScenario("pending");
    await submitProperty(scenario.actor, scenario.propertyId);

    await expect(
      setAgencyStatus(scenario.actor, scenario.agencyId, "verified"),
    ).rejects.toBeInstanceOf(AuthorizationError);
    await expect(
      moderateProperty(admin, scenario.propertyId, "reject", "corta"),
    ).rejects.toBeInstanceOf(WorkflowError);

    await moderateProperty(
      admin,
      scenario.propertyId,
      "reject",
      "La descripción requiere información verificable adicional.",
    );
    const result = await databasePool!.query(
      "select status, rejection_reason from properties where id = $1",
      [scenario.propertyId],
    );
    expect(result.rows[0]).toMatchObject({
      status: "rejected",
      rejection_reason:
        "La descripción requiere información verificable adicional.",
    });
  });

  it("suspender no elimina publicaciones existentes y la auditoría es inmutable", async () => {
    const scenario = await createScenario("verified");
    await submitProperty(scenario.actor, scenario.propertyId);
    await setAgencyStatus(admin, scenario.agencyId, "suspended");

    const property = await databasePool!.query(
      "select status from properties where id = $1",
      [scenario.propertyId],
    );
    expect(property.rows[0].status).toBe("published");

    const audit = await databasePool!.query<{ id: string }>(
      `select id from audit_events
       where entity_id = $1
       order by created_at desc
       limit 1`,
      [scenario.agencyId],
    );
    await expect(
      databasePool!.query(
        "update audit_events set action = 'tampered' where id = $1",
        [audit.rows[0].id],
      ),
    ).rejects.toMatchObject({ code: "P0001" });
  });
});
