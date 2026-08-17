"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  savePropertyAction,
  type PropertyActionState,
} from "@/app/panel/propiedades/actions";
import type { ManagedProperty } from "@/lib/repositories/properties";

const initialState: PropertyActionState = {
  status: "idle",
  message: "",
};

interface PropertyFormProps {
  agencyId: string;
  property?: ManagedProperty;
}

export function PropertyForm({ agencyId, property }: PropertyFormProps) {
  const [state, action, pending] = useActionState(
    savePropertyAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="mt-8 grid gap-6 rounded-2xl border border-[var(--line)] bg-white p-6"
    >
      <input type="hidden" name="agencyId" value={agencyId} />
      <input type="hidden" name="propertyId" value={property?.id ?? ""} />
      <Field
        label="Título"
        name="title"
        defaultValue={property?.title}
        error={state.errors?.title?.[0]}
      />
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Descripción
        <textarea
          name="description"
          defaultValue={property?.description}
          minLength={80}
          maxLength={3000}
          rows={7}
          required
          className="rounded-xl border border-[var(--line)] px-4 py-3 font-normal"
        />
        <FieldError message={state.errors?.description?.[0]} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Precio en COP"
          name="price"
          type="number"
          min="0"
          defaultValue={property?.price}
          error={state.errors?.price?.[0]}
        />
        <SelectField
          label="Tipo"
          name="propertyType"
          defaultValue={property?.propertyType}
          options={[
            ["lote", "Lote"],
            ["finca", "Finca"],
            ["terreno-rural", "Terreno rural"],
            ["terreno-urbano", "Terreno urbano"],
          ]}
        />
        <Field label="Departamento" name="department" defaultValue={property?.department} />
        <Field label="Municipio" name="municipality" defaultValue={property?.municipality} />
        <Field label="Dirección o vereda" name="address" defaultValue={property?.address} required={false} />
        <Field
          label="Área"
          name="area"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={property?.area}
        />
        <SelectField
          label="Unidad del área"
          name="areaUnit"
          defaultValue={property?.areaUnit}
          options={[
            ["m2", "Metros cuadrados"],
            ["hectareas", "Hectáreas"],
          ]}
        />
        <Field
          label="Acceso vial"
          name="roadAccess"
          defaultValue={property?.roadAccess}
          error={state.errors?.roadAccess?.[0]}
        />
      </div>
      <Field
        label="Usos recomendados, separados por coma"
        name="intendedUse"
        defaultValue={property?.intendedUse.join(", ")}
      />
      <Field
        label="Servicios, separados por coma"
        name="services"
        defaultValue={property?.services.join(", ")}
      />
      <Field
        label="Características destacadas, separadas por coma"
        name="highlights"
        defaultValue={property?.highlights.join(", ")}
      />
      <Field
        label="Información legal disponible, separada por coma"
        name="legalInfo"
        defaultValue={property?.legalInfo.join(", ")}
      />
      <Field
        label="Texto alternativo de las imágenes"
        name="imageAlt"
        defaultValue={property?.imageAlt}
        error={state.errors?.imageAlt?.[0]}
      />
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Imágenes
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required={!property}
          className="rounded-xl border border-[var(--line)] px-4 py-3 font-normal"
        />
        <span className="text-xs font-normal text-[var(--muted)]">
          Máximo 5 archivos por operación y 10 MB cada uno. Se convierten a WebP
          y se guardan dentro de PostgreSQL.
          {property ? ` Actualmente hay ${property.imageCount} imágenes.` : ""}
        </span>
      </label>
      <label className="inline-flex items-center gap-3 text-sm font-bold text-[var(--forest)]">
        <input
          name="negotiable"
          type="checkbox"
          defaultChecked={property?.negotiable}
          className="size-5"
        />
        Precio negociable
      </label>
      {state.message && (
        <div
          role="status"
          className={`rounded-lg px-4 py-3 text-sm ${
            state.status === "success"
              ? "bg-[#e8f3eb] text-[var(--forest)]"
              : "bg-[#f8e7e2] text-[#7a3027]"
          }`}
        >
          {state.message}
          {state.propertyId && (
            <Link
              href={`/panel/propiedades/${state.propertyId}`}
              className="ml-2 font-bold underline"
            >
              Abrir propiedad
            </Link>
          )}
        </div>
      )}
      <button
        disabled={pending}
        className="min-h-12 w-fit rounded-xl bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Procesando imágenes…" : property ? "Guardar cambios" : "Crear borrador"}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
  error?: string;
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  min,
  step,
  required = true,
  error,
}: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
      {label}
      <input
        name={name}
        type={type}
        min={min}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 rounded-xl border border-[var(--line)] px-4 font-normal"
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: [string, string][];
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs font-normal text-[#9a3f34]">{message}</span> : null;
}
