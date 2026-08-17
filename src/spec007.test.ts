// @vitest-environment node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import type { Actor } from "@/lib/auth/authorization";
import { AuthorizationError } from "@/lib/auth/authorization";
import {
  InvalidImageError,
  MAX_IMAGE_BYTES,
  serializeImage,
} from "@/lib/media/serialize-image";
import {
  archiveProperty,
  createProperty,
  getManagedProperty,
  updateProperty,
} from "@/lib/repositories/properties";
import { listPublishedProperties } from "@/lib/repositories/public-content";
import type { PropertyInput } from "@/lib/validation/property";
import { GET as getMedia } from "@/app/media/[id]/route";

const member: Actor = {
  userId: "user-agency-member",
  email: "agencia@raizdepueblo.local",
  name: "Gestor de inmobiliaria",
  platformAdmin: false,
  agencyIds: ["ag-boyaca-raiz"],
};
const outsider: Actor = {
  ...member,
  userId: "user-outsider",
  agencyIds: ["ag-tierra-cafetera"],
};

const baseInput: PropertyInput = {
  agencyId: "ag-boyaca-raiz",
  title: "Lote de prueba con vista al valle",
  description:
    "Propiedad creada exclusivamente por la prueba de integración para verificar persistencia, imágenes y aislamiento entre inmobiliarias.",
  price: 123_000_000,
  propertyType: "lote",
  department: "Boyacá",
  municipality: "Villa de Leyva",
  address: "Vereda de prueba",
  area: 1200,
  areaUnit: "m2",
  intendedUse: ["Vivienda campestre"],
  services: ["Energía"],
  roadAccess: "Acceso vehicular por vía afirmada",
  imageAlt: "Paisaje rural utilizado en una prueba automatizada",
  highlights: ["Vista abierta"],
  legalInfo: ["Información de prueba"],
  negotiable: true,
};

async function validFile() {
  const bytes = await readFile(resolve("public", "images", "villa-de-leyva.jpg"));
  return new File([bytes], "villa.jpg", { type: "image/jpeg" });
}

describe("SPEC007 serialización de imágenes", () => {
  it("convierte una imagen en variantes WebP con hash y dimensiones", async () => {
    const variants = await serializeImage(await validFile(), 0);

    expect(variants.map((variant) => variant.variant)).toEqual([
      "display",
      "thumbnail",
    ]);
    for (const variant of variants) {
      expect(variant.mimeType).toBe("image/webp");
      expect(variant.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(variant.byteSize).toBe(variant.content.byteLength);
      expect(variant.content.subarray(8, 12).toString()).toBe("WEBP");
      expect(variant.width).toBeGreaterThan(0);
      expect(variant.height).toBeGreaterThan(0);
    }
  });

  it("rechaza formatos y tamaños fuera del contrato", async () => {
    await expect(
      serializeImage(new File(["texto"], "archivo.txt", { type: "text/plain" }), 0),
    ).rejects.toBeInstanceOf(InvalidImageError);
    await expect(
      serializeImage(
        new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "grande.jpg", {
          type: "image/jpeg",
        }),
        0,
      ),
    ).rejects.toBeInstanceOf(InvalidImageError);
  });
});

const runDatabaseTests = process.env.RUN_DB_TESTS === "1";
const databasePool = runDatabaseTests
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

describe.skipIf(!runDatabaseTests)("SPEC007 CRUD e imágenes PostgreSQL", () => {
  afterAll(async () => databasePool?.end());

  it("crea, actualiza y archiva dentro del alcance autorizado", async () => {
    const images = await serializeImage(await validFile(), 0);
    const propertyId = await createProperty(member, baseInput, images);

    try {
      const created = await getManagedProperty(member, propertyId);
      expect(created).toMatchObject({
        status: "draft",
        imageCount: 1,
        agencyId: member.agencyIds[0],
      });
      await expect(
        getManagedProperty(outsider, propertyId),
      ).rejects.toBeInstanceOf(AuthorizationError);

      await updateProperty(
        member,
        {
          ...baseInput,
          propertyId,
          title: "Lote de prueba actualizado",
        },
        [],
      );
      await expect(
        getManagedProperty(member, propertyId),
      ).resolves.toMatchObject({ title: "Lote de prueba actualizado" });

      await archiveProperty(member, propertyId);
      await expect(
        getManagedProperty(member, propertyId),
      ).resolves.toMatchObject({ status: "archived" });
    } finally {
      await databasePool!.query("delete from properties where id = $1", [propertyId]);
    }
  });

  it("revierte la propiedad si falla la persistencia de una imagen", async () => {
    const variants = await serializeImage(await validFile(), 0);
    const duplicated = [
      variants[0],
      { ...variants[1], id: variants[0].id },
    ];

    await expect(
      createProperty(
        member,
        { ...baseInput, title: "Propiedad que debe revertirse" },
        duplicated,
      ),
    ).rejects.toMatchObject({ code: "23505" });

    const result = await databasePool!.query(
      "select 1 from properties where title = $1",
      ["Propiedad que debe revertirse"],
    );
    expect(result.rowCount).toBe(0);
  });

  it("niega medios de borradores y entrega publicados con ETag", async () => {
    const images = await serializeImage(await validFile(), 0);
    const propertyId = await createProperty(member, baseInput, images);
    const mediaId = images[0].id;

    try {
      const hidden = await getMedia(new Request(`http://localhost/media/${mediaId}`), {
        params: Promise.resolve({ id: mediaId }),
      });
      expect(hidden.status).toBe(404);

      await databasePool!.query(
        "update properties set status = 'published', published_at = current_timestamp where id = $1",
        [propertyId],
      );
      const visible = await getMedia(
        new Request(`http://localhost/media/${mediaId}`),
        { params: Promise.resolve({ id: mediaId }) },
      );
      expect(visible.status).toBe(200);
      expect(visible.headers.get("content-type")).toBe("image/webp");
      expect(visible.headers.get("cache-control")).toContain("immutable");

      const cached = await getMedia(
        new Request(`http://localhost/media/${mediaId}`, {
          headers: { "If-None-Match": visible.headers.get("etag")! },
        }),
        { params: Promise.resolve({ id: mediaId }) },
      );
      expect(cached.status).toBe(304);
    } finally {
      await databasePool!.query("delete from properties where id = $1", [propertyId]);
    }
  });

  it("alimenta el catálogo público desde URLs de medios PostgreSQL", async () => {
    const published = await listPublishedProperties();

    expect(published).toHaveLength(8);
    expect(published.every((property) => property.images.length > 0)).toBe(true);
    expect(
      published.flatMap((property) => property.images).every((url) => url.startsWith("/media/")),
    ).toBe(true);
    expect(published.every((property) => property.agencyName)).toBe(true);
  });
});
