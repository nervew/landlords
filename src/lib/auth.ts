import "server-only";

import { betterAuth } from "better-auth";
import { pool } from "@/lib/db/pool";

export const auth = betterAuth({
  appName: "Raíz de Pueblo",
  database: pool,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
