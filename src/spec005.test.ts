// @vitest-environment node

import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import {
  assertAgencyAccess,
  AuthorizationError,
  canAccessAgency,
  type Actor,
} from "@/lib/auth/authorization";
import { getAgencyForActor } from "@/lib/repositories/agencies";

const member: Actor = {
  userId: "user-agency-member",
  email: "agencia@raizdepueblo.local",
  name: "Gestor de inmobiliaria",
  platformAdmin: false,
  agencyIds: ["ag-boyaca-raiz"],
};
const admin: Actor = {
  ...member,
  userId: "user-platform-admin",
  platformAdmin: true,
  agencyIds: [],
};

describe("SPEC005 autorización", () => {
  it("permite la inmobiliaria propia y rechaza acceso cruzado", () => {
    expect(canAccessAgency(member, "ag-boyaca-raiz")).toBe(true);
    expect(canAccessAgency(member, "ag-tierra-cafetera")).toBe(false);
    expect(() => assertAgencyAccess(member, "ag-tierra-cafetera")).toThrow(
      AuthorizationError,
    );
  });

  it("permite al administrador operar cualquier inmobiliaria", () => {
    expect(canAccessAgency(admin, "ag-tierra-cafetera")).toBe(true);
  });
});

const runDatabaseTests = process.env.RUN_DB_TESTS === "1";
const databasePool = runDatabaseTests
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

describe.skipIf(!runDatabaseTests)("SPEC005 integración PostgreSQL", () => {
  afterAll(async () => databasePool?.end());

  it("usa un rol restringido y tiene todas las migraciones aplicadas", async () => {
    const result = await databasePool!.query<{
      current_user: string;
      rolsuper: boolean;
      auth_table: string;
      domain_table: string;
    }>(`
      select
        current_user,
        r.rolsuper,
        to_regclass('public.user')::text as auth_table,
        to_regclass('public.property_media')::text as domain_table
      from pg_roles r
      where r.rolname = current_user
    `);

    expect(result.rows[0]).toMatchObject({
      current_user: "landlords_app",
      rolsuper: false,
      auth_table: '"user"',
      domain_table: "property_media",
    });
    await expect(
      databasePool!.query("delete from schema_migrations"),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("lee únicamente la agencia autorizada desde el repositorio", async () => {
    const ownAgency = await getAgencyForActor(member, "ag-boyaca-raiz");
    expect(ownAgency?.name).toContain("Boyacá");

    await expect(
      getAgencyForActor(member, "ag-tierra-cafetera"),
    ).rejects.toBeInstanceOf(AuthorizationError);
    await expect(
      getAgencyForActor(admin, "ag-tierra-cafetera"),
    ).resolves.toMatchObject({ id: "ag-tierra-cafetera" });
  });

  it("mantiene las imágenes como bytea con tamaño coherente", async () => {
    const result = await databasePool!.query<{
      count: string;
      all_sizes_match: boolean;
    }>(`
      select
        count(*)::text as count,
        bool_and(octet_length(content) = byte_size) as all_sizes_match
      from property_media
    `);

    expect(result.rows[0]).toEqual({
      count: "48",
      all_sizes_match: true,
    });
  });

  it("autentica el usuario semilla con sesión persistente", async () => {
    const password = process.env.SEED_MEMBER_PASSWORD;
    expect(password).toBeTruthy();
    const { auth } = await import("@/lib/auth");
    const result = await auth.api.signInEmail({
      body: {
        email: member.email,
        password: password!,
      },
    });

    expect(result.user.email).toBe(member.email);
    expect(result.token).toBeTruthy();
  });
});
