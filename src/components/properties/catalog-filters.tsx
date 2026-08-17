"use client";

import type { PropertyFilters } from "@/types";

interface CatalogFiltersProps {
  filters: PropertyFilters;
  departments: string[];
  municipalities: string[];
  uses: string[];
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

const selectClass =
  "min-h-11 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]";

export function CatalogFilters({
  filters,
  departments,
  municipalities,
  uses,
  onChange,
  onClear,
}: CatalogFiltersProps) {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-extrabold text-[var(--forest)]">Filtrar resultados</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-bold text-[var(--earth)] underline underline-offset-4"
        >
          Limpiar
        </button>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Departamento
        <select
          value={filters.department}
          onChange={(event) => onChange("departamento", event.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {departments.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Municipio
        <select
          value={filters.municipality}
          onChange={(event) => onChange("municipio", event.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {municipalities.map((municipality) => (
            <option key={municipality} value={municipality}>{municipality}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Tipo de propiedad
        <select
          value={filters.propertyType}
          onChange={(event) => onChange("tipo", event.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          <option value="lote">Lote</option>
          <option value="finca">Finca</option>
          <option value="terreno-rural">Terreno rural</option>
          <option value="terreno-urbano">Terreno urbano</option>
        </select>
      </label>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold text-[var(--forest)]">Precio</legend>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="sr-only">Precio mínimo</span>
            <select
              value={filters.priceMin ?? ""}
              onChange={(event) => onChange("precioMin", event.target.value)}
              className={selectClass}
            >
              <option value="">Mínimo</option>
              <option value="150000000">$150 M</option>
              <option value="300000000">$300 M</option>
              <option value="500000000">$500 M</option>
              <option value="800000000">$800 M</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Precio máximo</span>
            <select
              value={filters.priceMax ?? ""}
              onChange={(event) => onChange("precioMax", event.target.value)}
              className={selectClass}
            >
              <option value="">Máximo</option>
              <option value="300000000">$300 M</option>
              <option value="500000000">$500 M</option>
              <option value="800000000">$800 M</option>
              <option value="1300000000">$1.300 M</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold text-[var(--forest)]">Área equivalente en m²</legend>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="sr-only">Área mínima</span>
            <select
              value={filters.areaMin ?? ""}
              onChange={(event) => onChange("areaMin", event.target.value)}
              className={selectClass}
            >
              <option value="">Mínima</option>
              <option value="500">500 m²</option>
              <option value="1000">1.000 m²</option>
              <option value="5000">5.000 m²</option>
              <option value="10000">1 ha</option>
              <option value="50000">5 ha</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Área máxima</span>
            <select
              value={filters.areaMax ?? ""}
              onChange={(event) => onChange("areaMax", event.target.value)}
              className={selectClass}
            >
              <option value="">Máxima</option>
              <option value="1000">1.000 m²</option>
              <option value="5000">5.000 m²</option>
              <option value="10000">1 ha</option>
              <option value="50000">5 ha</option>
              <option value="150000">15 ha</option>
            </select>
          </label>
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Uso recomendado
        <select
          value={filters.intendedUse}
          onChange={(event) => onChange("uso", event.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {uses.map((use) => (
            <option key={use} value={use}>{use}</option>
          ))}
        </select>
      </label>

      <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-[var(--forest)]">
        <input
          type="checkbox"
          checked={filters.featuredOnly}
          onChange={(event) => onChange("destacada", event.target.checked ? "true" : "")}
          className="size-5 accent-[var(--forest)]"
        />
        Solo propiedades destacadas
      </label>
    </div>
  );
}
