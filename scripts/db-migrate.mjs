import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

const adminUrl = process.env.DATABASE_ADMIN_URL;
const applicationUser = process.env.APP_DATABASE_USER ?? "landlords_app";

if (!adminUrl) {
  throw new Error("DATABASE_ADMIN_URL es obligatorio.");
}

if (!/^[a-z][a-z0-9_]*$/.test(applicationUser)) {
  throw new Error("APP_DATABASE_USER inválido.");
}

const migrationsDirectory = resolve("database", "migrations");
const files = (await readdir(migrationsDirectory))
  .filter((file) => /^\d{3}_[a-z0-9_-]+\.sql$/.test(file))
  .sort();
const client = new Client({ connectionString: adminUrl });
await client.connect();

try {
  await client.query(`
    create table if not exists schema_migrations (
      name text primary key,
      checksum char(64) not null,
      applied_at timestamptz not null default current_timestamp
    )
  `);

  for (const file of files) {
    const sql = await readFile(resolve(migrationsDirectory, file), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const applied = await client.query(
      "select checksum from schema_migrations where name = $1",
      [file],
    );

    if (applied.rowCount) {
      if (applied.rows[0].checksum !== checksum) {
        throw new Error(`La migración aplicada ${file} cambió de contenido.`);
      }
      continue;
    }

    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into schema_migrations (name, checksum) values ($1, $2)",
        [file, checksum],
      );
      await client.query("commit");
      console.log(`Aplicada ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  const role = `"${applicationUser.replaceAll('"', '""')}"`;
  await client.query(`grant usage on schema public to ${role}`);
  await client.query(
    `grant select, insert, update, delete on all tables in schema public to ${role}`,
  );
  await client.query(
    `alter default privileges in schema public grant select, insert, update, delete on tables to ${role}`,
  );
  await client.query(`revoke all on schema_migrations from ${role}`);
} finally {
  await client.end();
}
