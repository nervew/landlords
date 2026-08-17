"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import {
  InvalidImageError,
  serializeImages,
} from "@/lib/media/serialize-image";
import {
  archiveProperty,
  createProperty,
  getManagedProperty,
  updateProperty,
} from "@/lib/repositories/properties";
import { propertyInputSchema } from "@/lib/validation/property";

export interface PropertyActionState {
  status: "idle" | "success" | "error";
  message: string;
  propertyId?: string;
  errors?: Record<string, string[]>;
}

export async function savePropertyAction(
  _previous: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const actor = await getCurrentActor();
  if (!actor) {
    return { status: "error", message: "Tu sesión expiró. Vuelve a ingresar." };
  }

  const parsed = propertyInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos señalados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  try {
    const current = parsed.data.propertyId
      ? await getManagedProperty(actor, parsed.data.propertyId)
      : null;
    const images = await serializeImages(files, current?.imageCount ?? 0);

    let propertyId = parsed.data.propertyId;
    if (propertyId) {
      await updateProperty(
        actor,
        { ...parsed.data, propertyId },
        images,
      );
    } else {
      propertyId = await createProperty(actor, parsed.data, images);
    }

    revalidatePath("/panel");
    revalidatePath("/panel/propiedades");
    return {
      status: "success",
      message: parsed.data.propertyId
        ? "Propiedad actualizada y devuelta a borrador."
        : "Propiedad creada como borrador.",
      propertyId,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof InvalidImageError
          ? error.message
          : "No fue posible guardar la propiedad.",
    };
  }
}

export async function archivePropertyAction(formData: FormData): Promise<void> {
  const actor = await getCurrentActor();
  if (!actor) return;
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return;
  await archiveProperty(actor, propertyId);
  revalidatePath("/panel");
  revalidatePath("/panel/propiedades");
}
