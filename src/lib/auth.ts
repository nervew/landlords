import "server-only";

import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { isAuthorizedInvitationSignup } from "@/lib/auth/invitation-signup";
import { pool } from "@/lib/db/pool";
import { query } from "@/lib/db/pool";
import {
  queueEmail,
  scheduleEmailDelivery,
} from "@/lib/email/outbox";
import { passwordResetEmail } from "@/lib/email/templates";

export const auth = betterAuth({
  appName: "Raíz de Pueblo",
  database: pool,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    autoSignIn: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const outboxId = await queueEmail({
        kind: "password_reset",
        recipient: user.email,
        ...passwordResetEmail(url),
      });
      scheduleEmailDelivery(outboxId);
    },
    onPasswordReset: async ({ user }) => {
      await query(
        `insert into audit_events (
          id, actor_user_id, entity_type, entity_id, action
        ) values ($1, $2, 'user', $2, 'user.password_reset')`,
        [randomUUID(), user.id],
      );
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") return;
      const email =
        typeof context.body?.email === "string" ? context.body.email : "";
      const allowed = await isAuthorizedInvitationSignup(
        context.headers ?? context.request?.headers,
        email,
      );
      if (!allowed) {
        throw new APIError("FORBIDDEN", {
          message: "El registro requiere una invitación vigente.",
        });
      }
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
