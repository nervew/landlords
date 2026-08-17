import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { getInvitationByToken } from "@/lib/repositories/invitations";

const TOKEN_HEADER = "x-landlords-invitation";
const SIGNATURE_HEADER = "x-landlords-invitation-signature";

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("BETTER_AUTH_SECRET debe tener al menos 32 caracteres.");
  }
  return value;
}

function signature(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export function invitationSignupHeaders(token: string): Headers {
  return new Headers({
    [TOKEN_HEADER]: token,
    [SIGNATURE_HEADER]: signature(token),
  });
}

export async function isAuthorizedInvitationSignup(
  headers: Headers | undefined,
  email: string,
): Promise<boolean> {
  const token = headers?.get(TOKEN_HEADER) ?? "";
  const received = headers?.get(SIGNATURE_HEADER) ?? "";
  if (!token || !/^[a-f0-9]{64}$/.test(received)) return false;
  const expected = signature(token);
  if (
    !timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(expected, "hex"),
    )
  ) {
    return false;
  }
  const invitation = await getInvitationByToken(token);
  return (
    invitation?.state === "pending" &&
    invitation.email === email.trim().toLowerCase() &&
    !invitation.existingUserId
  );
}

