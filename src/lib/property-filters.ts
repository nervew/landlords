import { areaToSquareMeters } from "@/lib/format";
import type { Property, PropertyFilters } from "@/types";

export const defaultPropertyFilters: PropertyFilters = {
  query: "",
  department: "",
  municipality: "",
  propertyType: "",
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  intendedUse: "",
  featuredOnly: false,
  sort: "relevance",
};

function parsePositiveNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-CO")
    .trim();
}

export function filtersFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
): PropertyFilters {
  const validSorts: PropertyFilters["sort"][] = [
    "relevance",
    "newest",
    "price-asc",
    "price-desc",
  ];
  const requestedSort = searchParams.get("orden") as PropertyFilters["sort"] | null;

  return {
    query: searchParams.get("q") ?? "",
    department: searchParams.get("departamento") ?? "",
    municipality: searchParams.get("municipio") ?? "",
    propertyType: searchParams.get("tipo") ?? "",
    priceMin: parsePositiveNumber(searchParams.get("precioMin")),
    priceMax: parsePositiveNumber(searchParams.get("precioMax")),
    areaMin: parsePositiveNumber(searchParams.get("areaMin")),
    areaMax: parsePositiveNumber(searchParams.get("areaMax")),
    intendedUse: searchParams.get("uso") ?? "",
    featuredOnly: searchParams.get("destacada") === "true",
    sort: requestedSort && validSorts.includes(requestedSort) ? requestedSort : "relevance",
  };
}

export function filterProperties(
  source: Property[],
  filters: PropertyFilters,
) {
  const query = normalizeText(filters.query);
  const [priceMin, priceMax] =
    filters.priceMin !== null &&
    filters.priceMax !== null &&
    filters.priceMin > filters.priceMax
      ? [filters.priceMax, filters.priceMin]
      : [filters.priceMin, filters.priceMax];
  const [areaMin, areaMax] =
    filters.areaMin !== null &&
    filters.areaMax !== null &&
    filters.areaMin > filters.areaMax
      ? [filters.areaMax, filters.areaMin]
      : [filters.areaMin, filters.areaMax];

  const filtered = source.filter((property) => {
    const searchable = normalizeText(
      [
        property.title,
        property.description,
        property.department,
        property.municipality,
        property.propertyType,
        ...property.intendedUse,
      ].join(" "),
    );
    const area = areaToSquareMeters(property.area, property.areaUnit);

    return (
      (!query || searchable.includes(query)) &&
      (!filters.department || property.department === filters.department) &&
      (!filters.municipality || property.municipality === filters.municipality) &&
      (!filters.propertyType || property.propertyType === filters.propertyType) &&
      (priceMin === null || property.price >= priceMin) &&
      (priceMax === null || property.price <= priceMax) &&
      (areaMin === null || area >= areaMin) &&
      (areaMax === null || area <= areaMax) &&
      (!filters.intendedUse || property.intendedUse.includes(filters.intendedUse)) &&
      (!filters.featuredOnly || property.featured)
    );
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    if (filters.sort === "newest") {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }

    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
