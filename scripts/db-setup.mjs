import { randomBytes } from "node:crypto";
import { Client } from "pg";

const adminUrl = process.env.POSTGRES_ADMIN_URL;
const databaseName = process.env.APP_DATABASE_NAME ?? "landlords";
const applicationUser = process.env.APP_DATABASE_USER ?? "landlords_app";
const applicationPassword =
  process.env.APP_DATABASE_PASSWORD ?? randomBytes(24).toString("base64url");

if (!adminUrl) {
  throw new Error("POSTGRES_ADMIN_URL es obligatorio.");
}

for (const [name, value] of [
  ["APP_DATABASE_NAME", databaseName],
  ["APP_DATABASE_USER", applicationUser],
]) {
  if (!/^[a-z][a-z0-9_]*$/.test(value)) {
    throw new Error(`${name} solo admite letras minúsculas, números y guion bajo.`);
  }
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function databaseUrl(baseUrl, database, user, password) {
  const url = new URL(baseUrl);
  url.username = user;
  url.password = password;
  url.pathname = `/${database}`;
  return url.toString();
}

const admin = new Client({ connectionString: adminUrl });
await admin.connect();

try {
  const role = await admin.query("select 1 from pg_roles where rolname = $1", [
    applicationUser,
  ]);

  if (role.rowCount === 0) {
    await admin.query(
      `create role ${quoteIdentifier(applicationUser)} login password '${applicationPassword.replaceAll("'", "''")}' nosuperuser nocreatedb nocreaterole noinherit`,
    );
  } else if (process.env.APP_DATABASE_PASSWORD) {
    await admin.query(
      `alter role ${quoteIdentifier(applicationUser)} password '${applicationPassword.replaceAll("'", "''")}'`,
    );
  }

  const database = await admin.query(
    "select 1 from pg_database where datname = $1",
    [databaseName],
  );

  if (database.rowCount === 0) {
    await admin.query(`create database ${quoteIdentifier(databaseName)}`);
  }

  await admin.query(
    `grant connect on database ${quoteIdentifier(databaseName)} to ${quoteIdentifier(applicationUser)}`,
  );
} finally {
  await admin.end();
}

const generatedUrl = databaseUrl(
  adminUrl,
  databaseName,
  applicationUser,
  applicationPassword,
);

console.log("Base y rol de aplicación preparados.");
console.log(`DATABASE_URL=${generatedUrl}`);
console.log("Guarda DATABASE_URL en .env.local; esta salida no se registra en Git.");
