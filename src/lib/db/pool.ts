import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

const missingDatabaseUrl =
  "postgresql://missing:missing@127.0.0.1:5432/missing";

declare global {
  var __landlordsPool: Pool | undefined;
}

export const pool =
  globalThis.__landlordsPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL ?? missingDatabaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__landlordsPool = pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
) {
  return pool.query<T>(text, [...values]);
}

export async function inTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
