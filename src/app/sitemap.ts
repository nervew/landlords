import type { MetadataRoute } from "next";
import { agencies } from "@/data/agencies";
import { properties } from "@/data/properties";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date("2026-07-22"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/propiedades"),
      lastModified: new Date("2026-07-22"),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: absoluteUrl(`/propiedades/${property.slug}`),
    lastModified: new Date(property.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const agencyRoutes: MetadataRoute.Sitemap = agencies.map((agency) => ({
    url: absoluteUrl(`/inmobiliarias/${agency.slug}`),
    lastModified: new Date("2026-07-22"),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...propertyRoutes, ...agencyRoutes];
}
