"use client";

import { useActionState } from "react";
import type { ManagedAgency } from "@/lib/repositories/agencies";
import {
  updateAgencyProfileAction,
  type AgencyProfileActionState,
} from "@/app/panel/perfil/actions";

const initialState: AgencyProfileActionState = {
  status: "idle",
  message: "",
};

export function AgencyProfileForm({ agency }: { agency: ManagedAgency }) {
  const [state, action, pending] = useActionState(
    updateAgencyProfileAction,
    initialState,
  );

  return (
    <form action={action} className="mt-8 grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-6">
      <input type="hidden" name="agencyId" value={agency.id} />
      <Field label="Nombre comercial" name="name" defaultValue={agency.name} error={state.errors?.name?.[0]} />
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Descripción
        <textarea
          name="description"
          defaultValue={agency.description}
          minLength={40}
          maxLength={1200}
          rows={6}
          required
          className="rounded-xl border border-[var(--line)] px-4 py-3 font-normal"
        />
        <FieldError message={state.errors?.description?.[0]} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Departamento" name="department" defaultValue={agency.department} error={state.errors?.department?.[0]} />
        <Field label="Municipio" name="municipality" defaultValue={agency.municipality} error={state.errors?.municipality?.[0]} />
        <Field label="Teléfono" name="phone" defaultValue={agency.phone} error={state.errors?.phone?.[0]} />
        <Field label="WhatsApp (solo dígitos)" name="whatsapp" defaultValue={agency.whatsapp} error={state.errors?.whatsapp?.[0]} />
      </div>
      <Field label="Correo de contacto" name="email" type="email" defaultValue={agency.email} error={state.errors?.email?.[0]} />
      {state.message && (
        <p
          role="status"
          className={`rounded-lg px-4 py-3 text-sm ${
            state.status === "success"
              ? "bg-[#e8f3eb] text-[var(--forest)]"
              : "bg-[#f8e7e2] text-[#7a3027]"
          }`}
        >
          {state.message}
        </p>
      )}
      <button
        disabled={pending}
        className="min-h-12 w-fit rounded-xl bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  error?: string;
}

function Field({ label, name, defaultValue, type = "text", error }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required
        className="min-h-12 rounded-xl border border-[var(--line)] px-4 font-normal"
      />
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs font-normal text-[#9a3f34]">{message}</span> : null;
}
