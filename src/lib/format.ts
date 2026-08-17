import type { AreaUnit, PropertyType } from "@/types";

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

export function formatPrice(value: number) {
  return copFormatter.format(value);
}

export function formatArea(value: number, unit: AreaUnit) {
  const label = unit === "m2" ? "m²" : value === 1 ? "hectárea" : "hectáreas";
  return `${numberFormatter.format(value)} ${label}`;
}

export function areaToSquareMeters(value: number, unit: AreaUnit) {
  return unit === "hectareas" ? value * 10_000 : value;
}

export function formatPropertyType(type: PropertyType) {
  const labels: Record<PropertyType, string> = {
    lote: "Lote",
    finca: "Finca",
    "terreno-rural": "Terreno rural",
    "terreno-urbano": "Terreno urbano",
  };

  return labels[type];
}

export function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
