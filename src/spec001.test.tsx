import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { agencies } from "@/data/agencies";
import { properties } from "@/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import { HomeSearch } from "@/components/home/home-search";
import { PropertyCard } from "@/components/properties/property-card";

describe("SPEC001: base, datos e inicio", () => {
  it("incluye el volumen mínimo y mantiene referencias consistentes", () => {
    expect(properties).toHaveLength(8);
    expect(agencies).toHaveLength(3);

    const propertySlugs = new Set(properties.map((property) => property.slug));
    const agencyIds = new Set(agencies.map((agency) => agency.id));

    expect(propertySlugs.size).toBe(properties.length);
    expect(properties.every((property) => agencyIds.has(property.agencyId))).toBe(true);
    expect(properties.every((property) => property.images.length >= 3)).toBe(true);
  });

  it("formatea precios y áreas para Colombia", () => {
    expect(formatPrice(285000000)).toMatch(/\$[\s\u00a0]?285\.000\.000/);
    expect(formatArea(2400, "m2")).toBe("2.400 m²");
    expect(formatArea(8.4, "hectareas")).toBe("8,4 hectáreas");
  });

  it("expone controles accesibles en el buscador principal", () => {
    render(<HomeSearch />);

    const form = screen.getByRole("form", { name: "Buscar propiedades" });
    expect(form).toHaveAttribute("action", "/propiedades");
    expect(screen.getByRole("searchbox", { name: "Municipio o departamento" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Tipo de propiedad" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Buscar" })).toBeVisible();
  });

  it("muestra una tarjeta completa y enlaza su detalle", () => {
    const property = properties[0];
    render(<PropertyCard property={property} />);

    expect(screen.getByText(property.title)).toBeVisible();
    expect(screen.getByText(/Villa de Leyva, Boyacá/)).toBeVisible();
    expect(screen.getByText("Destacado")).toBeVisible();
    expect(
      screen.getByRole("link", { name: `Ver ${property.title}` }),
    ).toHaveAttribute("href", `/propiedades/${property.slug}`);
  });
});
