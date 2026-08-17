// @vitest-environment node

import { describe, expect, it } from "vitest";
import type { Actor } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization";
import {
  getAgencyForActor,
  updateAgencyProfile,
} from "@/lib/repositories/agencies";
import { agencyProfileSchema } from "@/lib/validation/agency";

const member: Actor = {
  userId: "user-agency-member",
  email: "agencia@raizdepueblo.local",
  name: "Gestor de inmobiliaria",
  platformAdmin: false,
  agencyIds: ["ag-boyaca-raiz"],
};

describe("SPEC006 validación del perfil", () => {
  it("acepta un perfil completo y normaliza espacios", () => {
    const result = agencyProfileSchema.parse({
      agencyId: "ag-boyaca-raiz",
      name: "  Boyacá Raíz  ",
      description:
        "  Equipo local con experiencia suficiente para describir el territorio y sus propiedades.  ",
      department: " Boyacá ",
      municipality: " Villa de Leyva ",
      phone: "+57 310 555 0182",
      whatsapp: "573105550182",
      email: "hola@boyacaraiz.demo",
    });

    expect(result.name).toBe("Boyacá Raíz");
    expect(result.department).toBe("Boyacá");
  });

  it("rechaza descripción corta, correo y WhatsApp inválidos", () => {
    const result = agencyProfileSchema.safeParse({
      agencyId: "ag-boyaca-raiz",
      name: "BR",
      description: "Muy corta",
      department: "B",
      municipality: "V",
      phone: "x",
      whatsapp: "+57 310",
      email: "invalido",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields).toHaveProperty("description");
      expect(fields).toHaveProperty("whatsapp");
      expect(fields).toHaveProperty("email");
    }
  });
});

describe.skipIf(process.env.RUN_DB_TESTS !== "1")(
  "SPEC006 integración del perfil",
  () => {
    it("actualiza solo la agencia propia y registra auditoría", async () => {
      const original = await getAgencyForActor(member, "ag-boyaca-raiz");
      expect(original).not.toBeNull();

      const changedName = `${original!.name} prueba`;
      try {
        await updateAgencyProfile(member, {
          agencyId: original!.id,
          name: changedName,
          description: original!.description,
          department: original!.department,
          municipality: original!.municipality,
          phone: original!.phone,
          whatsapp: original!.whatsapp,
          email: original!.email,
        });

        await expect(
          getAgencyForActor(member, original!.id),
        ).resolves.toMatchObject({ name: changedName });

        const { query } = await import("@/lib/db/pool");
        const audit = await query<{ count: string }>(
          `select count(*)::text as count
           from audit_events
           where actor_user_id = $1
             and entity_id = $2
             and action = 'agency.profile_updated'`,
          [member.userId, original!.id],
        );
        expect(Number(audit.rows[0].count)).toBeGreaterThan(0);
      } finally {
        await updateAgencyProfile(member, {
          agencyId: original!.id,
          name: original!.name,
          description: original!.description,
          department: original!.department,
          municipality: original!.municipality,
          phone: original!.phone,
          whatsapp: original!.whatsapp,
          email: original!.email,
        });
      }
    });

    it("rechaza una actualización cruzada antes de ejecutar SQL", async () => {
      await expect(
        updateAgencyProfile(member, {
          agencyId: "ag-tierra-cafetera",
          name: "Tierra Cafetera",
          description:
            "Descripción válida que nunca debe persistirse por falta de autorización del actor.",
          department: "Quindío",
          municipality: "Salento",
          phone: "+57 315 555 0274",
          whatsapp: "573155550274",
          email: "contacto@tierracafetera.demo",
        }),
      ).rejects.toBeInstanceOf(AuthorizationError);
    });
  },
);
