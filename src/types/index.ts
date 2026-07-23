export type PropertyType =
  | "lote"
  | "finca"
  | "terreno-rural"
  | "terreno-urbano";

export type AreaUnit = "m2" | "hectareas";

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: "COP";
  propertyType: PropertyType;
  department: string;
  municipality: string;
  address?: string;
  area: number;
  areaUnit: AreaUnit;
  intendedUse: string[];
  services: string[];
  roadAccess: string;
  images: string[];
  imageAlt: string;
  featured: boolean;
  negotiable: boolean;
  publishedAt: string;
  agencyId: string;
  highlights: string[];
  legalInfo: string[];
  latitude?: number;
  longitude?: number;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  department: string;
  municipality: string;
  phone: string;
  whatsapp: string;
  email: string;
  verified: boolean;
}

export interface PropertyFilters {
  query: string;
  department: string;
  municipality: string;
  propertyType: string;
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  intendedUse: string;
  featuredOnly: boolean;
  sort: "relevance" | "newest" | "price-asc" | "price-desc";
}
