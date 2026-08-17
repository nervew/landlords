"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import { submitProperty } from "@/lib/repositories/moderation";

export async function submitPropertyAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) return;
  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return;
  await submitProperty(actor, propertyId);
  revalidatePath("/panel");
  revalidatePath("/panel/propiedades");
  revalidatePath("/propiedades");
  revalidatePath("/");
}
