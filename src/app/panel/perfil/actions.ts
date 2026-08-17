"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import { updateAgencyProfile } from "@/lib/repositories/agencies";
import { agencyProfileSchema } from "@/lib/validation/agency";

export interface AgencyProfileActionState {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[]>;
}

export async function updateAgencyProfileAction(
  _previous: AgencyProfileActionState,
  formData: FormData,
): Promise<AgencyProfileActionState> {
  const actor = await getCurrentActor();
  if (!actor) {
    return { status: "error", message: "Tu sesión expiró. Vuelve a ingresar." };
  }

  const parsed = agencyProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos señalados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateAgencyProfile(actor, parsed.data);
    revalidatePath("/panel");
    revalidatePath("/panel/perfil");
    revalidatePath("/inmobiliarias/[slug]", "page");
    return { status: "success", message: "Perfil actualizado." };
  } catch {
    return {
      status: "error",
      message: "No fue posible actualizar el perfil.",
    };
  }
}
