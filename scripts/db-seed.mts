import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hashPassword } from "better-auth/crypto";
import { Pool, type PoolClient } from "pg";
import sharp from "sharp";
import { agencies } from "../src/data/agencies.ts";
import { properties } from "../src/data/properties.ts";

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@raizdepueblo.local";
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const memberEmail = process.env.SEED_MEMBER_EMAIL ?? "agencia@raizdepueblo.local";
const memberPassword = process.env.SEED_MEMBER_PASSWORD;

if (!databaseUrl || !adminPassword || !memberPassword) {
  throw new Error(
    "DATABASE_URL, SEED_ADMIN_PASSWORD y SEED_MEMBER_PASSWORD son obligatorios.",
  );
}

async function upsertUser(
  client: PoolClient,
  input: { id: string; name: string; email: string; password: string },
) {
  const password = await hashPassword(input.password);
  await client.query(
    `insert into "user"
      ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    values ($1, $2, $3, true, current_timestamp, current_timestamp)
    on conflict ("id") do update set
      "name" = excluded."name",
      "email" = excluded."email",
      "emailVerified" = true,
      "updatedAt" = current_timestamp`,
    [input.id, input.name, input.email],
  );
  await client.query(
    `insert into "account"
      ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    values ($1, $2, 'credential', $2, $3, current_timestamp, current_timestamp)
    on conflict ("id") do update set
      "password" = excluded."password",
      "updatedAt" = current_timestamp`,
    [`account-${input.id}`, input.id, password],
  );
}

const pool = new Pool({ connectionString: databaseUrl });
const client = await pool.connect();

try {
  await client.query("begin");

  await upsertUser(client, {
    id: "user-platform-admin",
    name: "Administrador local",
    email: adminEmail,
    password: adminPassword,
  });
  await upsertUser(client, {
    id: "user-agency-member",
    name: "Gestor de inmobiliaria",
    email: memberEmail,
    password: memberPassword,
  });

  await client.query(
    `insert into platform_admins (user_id)
     values ('user-platform-admin')
     on conflict (user_id) do nothing`,
  );

  for (const agency of agencies) {
    await client.query(
      `insert into agencies (
        id, name, slug, logo, description, department, municipality,
        phone, whatsapp, email, status
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      on conflict (id) do update set
        name = excluded.name,
        slug = excluded.slug,
        logo = excluded.logo,
        description = excluded.description,
        department = excluded.department,
        municipality = excluded.municipality,
        phone = excluded.phone,
        whatsapp = excluded.whatsapp,
        email = excluded.email,
        status = excluded.status,
        updated_at = current_timestamp`,
      [
        agency.id,
        agency.name,
        agency.slug,
        agency.logo,
        agency.description,
        agency.department,
        agency.municipality,
        agency.phone,
        agency.whatsapp,
        agency.email,
        agency.verified ? "verified" : "pending",
      ],
    );
  }

  await client.query(
    `insert into agency_members (agency_id, user_id, role)
     values ('ag-boyaca-raiz', 'user-agency-member', 'owner')
     on conflict (agency_id, user_id) do update set role = excluded.role`,
  );

  for (const property of properties) {
    await client.query(
      `insert into properties (
        id, agency_id, slug, title, description, price, currency,
        property_type, department, municipality, address, area, area_unit,
        intended_use, services, road_access, featured, negotiable, image_alt,
        highlights, legal_info, latitude, longitude, status, published_at
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 'published', $24
      )
      on conflict (id) do update set
        agency_id = excluded.agency_id,
        slug = excluded.slug,
        title = excluded.title,
        description = excluded.description,
        price = excluded.price,
        property_type = excluded.property_type,
        department = excluded.department,
        municipality = excluded.municipality,
        address = excluded.address,
        area = excluded.area,
        area_unit = excluded.area_unit,
        intended_use = excluded.intended_use,
        services = excluded.services,
        road_access = excluded.road_access,
        featured = excluded.featured,
        negotiable = excluded.negotiable,
        image_alt = excluded.image_alt,
        highlights = excluded.highlights,
        legal_info = excluded.legal_info,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        status = 'published',
        published_at = excluded.published_at,
        updated_at = current_timestamp`,
      [
        property.id,
        property.agencyId,
        property.slug,
        property.title,
        property.description,
        property.price,
        property.currency,
        property.propertyType,
        property.department,
        property.municipality,
        property.address ?? null,
        property.area,
        property.areaUnit,
        property.intendedUse,
        property.services,
        property.roadAccess,
        property.featured,
        property.negotiable,
        property.imageAlt,
        property.highlights,
        property.legalInfo,
        property.latitude ?? null,
        property.longitude ?? null,
        property.publishedAt,
      ],
    );

    for (const [position, imagePath] of property.images.entries()) {
      const source = await readFile(resolve("public", imagePath.replace(/^\//, "")));
      const variants = [
        {
          name: "display",
          width: 1600,
          buffer: await sharp(source)
            .rotate()
            .resize({ width: 1600, height: 1200, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer(),
        },
        {
          name: "thumbnail",
          width: 640,
          buffer: await sharp(source)
            .rotate()
            .resize({ width: 640, height: 480, fit: "cover" })
            .webp({ quality: 76 })
            .toBuffer(),
        },
      ] as const;

      for (const variant of variants) {
        const metadata = await sharp(variant.buffer).metadata();
        const id = `${property.id}-${position}-${variant.name}`;
        await client.query(
          `insert into property_media (
            id, property_id, variant, position, mime_type, width, height,
            byte_size, sha256, content
          ) values ($1, $2, $3, $4, 'image/webp', $5, $6, $7, $8, $9)
          on conflict (property_id, position, variant) do update set
            width = excluded.width,
            height = excluded.height,
            byte_size = excluded.byte_size,
            sha256 = excluded.sha256,
            content = excluded.content`,
          [
            id,
            property.id,
            variant.name,
            position,
            metadata.width,
            metadata.height,
            variant.buffer.byteLength,
            createHash("sha256").update(variant.buffer).digest("hex"),
            variant.buffer,
          ],
        );
      }
    }
  }

  await client.query("commit");
  console.log(
    `Semilla aplicada: ${agencies.length} inmobiliarias, ${properties.length} propiedades y ${properties.reduce((total, property) => total + property.images.length * 2, 0)} imágenes derivadas.`,
  );
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
