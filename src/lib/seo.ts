import type { Agency, Property } from "@/types";
import { formatArea, formatPropertyType } from "@/lib/format";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://raizdepueblo.demo";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function propertyJsonLd(property: Property, agency: Agency) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description,
    sku: property.id,
    category: formatPropertyType(property.propertyType),
    image: property.images.map(absoluteUrl),
    url: absoluteUrl(`/propiedades/${property.slug}`),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Área total",
        value: formatArea(property.area, property.areaUnit),
      },
      {
        "@type": "PropertyValue",
        name: "Municipio",
        value: property.municipality,
      },
      {
        "@type": "PropertyValue",
        name: "Departamento",
        value: property.department,
      },
    ],
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      url: absoluteUrl(`/propiedades/${property.slug}`),
      seller: {
        "@type": "Organization",
        name: agency.name,
        email: agency.email,
        telephone: agency.phone,
      },
    },
  };
}

export function agencyJsonLd(agency: Agency) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agency.name,
    description: agency.description,
    url: absoluteUrl(`/inmobiliarias/${agency.slug}`),
    email: agency.email,
    telephone: agency.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: agency.municipality,
      addressRegion: agency.department,
      addressCountry: "CO",
    },
  };
}

export function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
