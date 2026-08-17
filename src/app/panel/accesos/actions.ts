"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import {
  retryEmail,
  scheduleEmailDelivery,
} from "@/lib/email/outbox";
import {
  createInvitation,
  InvitationError,
  revokeInvitation,
} from "@/lib/repositories/invitations";
import { createInvitationSchema } from "@/lib/validation/invitation";

export interface AccessActionState {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[]>;
}

export async function createInvitationAction(
  _previous: AccessActionState,
  formData: FormData,
): Promise<AccessActionState> {
  const actor = await getCurrentActor();
  if (!actor?.platformAdmin) {
    return { status: "error", message: "Esta acción requiere administración." };
  }
  const parsed = createInvitationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const result = await createInvitation(actor, parsed.data);
    scheduleEmailDelivery(result.outboxId);
    revalidatePath("/panel/accesos");
    return {
      status: "success",
      message: "Invitación creada y guardada en la bandeja de salida.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof InvitationError
          ? error.message
          : "No fue posible crear la invitación.",
    };
  }
}

export async function revokeInvitationAction(formData: FormData): Promise<void> {
  const actor = await getCurrentActor();
  if (!actor?.platformAdmin) return;
  const invitationId = String(formData.get("invitationId") ?? "");
  if (!invitationId) return;
  try {
    await revokeInvitation(actor, invitationId);
    revalidatePath("/panel/accesos");
  } catch {
    return;
  }
}

export async function retryEmailAction(formData: FormData): Promise<void> {
  const actor = await getCurrentActor();
  if (!actor?.platformAdmin) return;
  const outboxId = String(formData.get("outboxId") ?? "");
  if (!outboxId) return;
  await retryEmail(outboxId);
  scheduleEmailDelivery(outboxId);
  revalidatePath("/panel/accesos");
}
