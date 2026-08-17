"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import {
  moderateProperty,
  setAgencyStatus,
} from "@/lib/repositories/moderation";
import type { AgencyStatus } from "@/lib/repositories/agencies";

export async function changeAgencyStatusAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) return;
  const agencyId = String(formData.get("agencyId") ?? "");
  const status = String(formData.get("status") ?? "") as AgencyStatus;
  if (!["pending", "verified", "suspended"].includes(status)) return;
  await setAgencyStatus(actor, agencyId, status);
  revalidatePath("/panel");
  revalidatePath("/panel/moderacion");
}

export async function moderatePropertyAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) return;
  const propertyId = String(formData.get("propertyId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (decision !== "approve" && decision !== "reject") return;
  await moderateProperty(actor, propertyId, decision, reason);
  revalidatePath("/panel/moderacion");
  revalidatePath("/propiedades");
  revalidatePath("/");
}
