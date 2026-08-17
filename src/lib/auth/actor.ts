import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db/pool";
import type { Actor } from "./authorization";

export {
  assertAgencyAccess,
  assertPlatformAdmin,
  AuthorizationError,
  canAccessAgency,
} from "./authorization";
export type { Actor } from "./authorization";

export async function getCurrentActor(): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [admin, memberships] = await Promise.all([
    query<{ exists: boolean }>(
      `select exists(
        select 1 from platform_admins where user_id = $1
      ) as exists`,
      [session.user.id],
    ),
    query<{ agency_id: string }>(
      "select agency_id from agency_members where user_id = $1 order by agency_id",
      [session.user.id],
    ),
  ]);

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    platformAdmin: admin.rows[0]?.exists ?? false,
    agencyIds: memberships.rows.map((membership) => membership.agency_id),
  };
}
