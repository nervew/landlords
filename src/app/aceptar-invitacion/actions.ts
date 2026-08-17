"use server";

import { getCurrentActor } from "@/lib/auth/actor";
import { invitationSignupHeaders } from "@/lib/auth/invitation-signup";
import { auth } from "@/lib/auth";
import {
  acceptExistingInvitation,
  acceptNewInvitation,
  InvitationError,
} from "@/lib/repositories/invitations";
import { acceptInvitationSchema } from "@/lib/validation/invitation";

export interface InvitationActionState {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[]>;
}

export async function acceptNewInvitationAction(
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const actor = await getCurrentActor();
  if (actor) {
    return {
      status: "error",
      message: "Cierra la sesión actual antes de crear otra cuenta.",
    };
  }
  const parsed = acceptInvitationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await acceptNewInvitation(parsed.data.token, async (email) => {
      const result = await auth.api.signUpEmail({
        headers: invitationSignupHeaders(parsed.data.token),
        body: {
          email,
          name: parsed.data.name,
          password: parsed.data.password,
          rememberMe: false,
        },
      });
      return result.user.id;
    });
    return {
      status: "success",
      message: "Cuenta creada e invitación aceptada. Ya puedes ingresar.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof InvitationError
          ? error.message
          : "No fue posible aceptar la invitación.",
    };
  }
}

export async function acceptExistingInvitationAction(
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const actor = await getCurrentActor();
  if (!actor) {
    return { status: "error", message: "Ingresa antes de aceptar." };
  }
  const token = String(formData.get("token") ?? "");
  try {
    await acceptExistingInvitation(actor, token);
    return {
      status: "success",
      message: "Invitación aceptada. La inmobiliaria ya está disponible en tu panel.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof InvitationError
          ? error.message
          : "No fue posible aceptar la invitación.",
    };
  }
}
