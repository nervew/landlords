import { describe, expect, it } from "vitest";
import { properties } from "@/data/properties";
import {
  defaultPropertyFilters,
  filterProperties,
  filtersFromSearchParams,
} from "@/lib/property-filters";

describe("SPEC002: catálogo, búsqueda y filtros", () => {
  it("busca sin depender de mayúsculas ni tildes", () => {
    const results = filterProperties([...properties], {
      ...defaultPropertyFilters,
      query: "sachica",
    });

    expect(results.map((property) => property.municipality)).toEqual(["Sáchica"]);
  });

  it("combina ubicación, tipo, uso y propiedad destacada", () => {
    const results = filterProperties([...properties], {
      ...defaultPropertyFilters,
      department: "Antioquia",
      propertyType: "finca",
      intendedUse: "Turismo",
      featuredOnly: true,
    });

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("finca-cafetera-en-jerico");
  });

  it("normaliza hectáreas a metros cuadrados y corrige rangos invertidos", () => {
    const results = filterProperties([...properties], {
      ...defaultPropertyFilters,
      areaMin: 100_000,
      areaMax: 50_000,
    });

    expect(results.every((property) => property.areaUnit === "hectareas")).toBe(true);
    expect(results.map((property) => property.area)).toEqual(
      expect.arrayContaining([8.4, 5.2]),
    );
  });

  it("ordena por precio y fecha", () => {
    const ascending = filterProperties([...properties], {
      ...defaultPropertyFilters,
      sort: "price-asc",
    });
    const newest = filterProperties([...properties], {
      ...defaultPropertyFilters,
      sort: "newest",
    });

    expect(ascending[0].price).toBe(Math.min(...properties.map((property) => property.price)));
    expect(newest[0].publishedAt).toBe("2026-07-18");
  });

  it("interpreta parámetros válidos e ignora ordenamientos desconocidos", () => {
    const params = new URLSearchParams(
      "q=Villa&tipo=lote&precioMax=300000000&destacada=true&orden=desconocido",
    );
    const filters = filtersFromSearchParams(params);

    expect(filters).toMatchObject({
      query: "Villa",
      propertyType: "lote",
      priceMax: 300000000,
      featuredOnly: true,
      sort: "relevance",
    });
  });

  it("devuelve estado vacío para una combinación sin coincidencias", () => {
    const results = filterProperties([...properties], {
      ...defaultPropertyFilters,
      department: "Boyacá",
      intendedUse: "Conservación",
    });

    expect(results).toEqual([]);
  });
});
