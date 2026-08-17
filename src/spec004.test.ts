import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { buildSitemap } from "@/app/sitemap";
import { agencies } from "@/data/agencies";
import { properties } from "@/data/properties";
import {
  agencyJsonLd,
  propertyJsonLd,
  serializeJsonLd,
  SITE_URL,
} from "@/lib/seo";

describe("SPEC004: SEO, accesibilidad y calidad", () => {
  it("publica todas las rutas indexables sin duplicados", () => {
    const entries = buildSitemap(properties, agencies);
    const urls = entries.map((entry) => entry.url);

    expect(entries).toHaveLength(2 + properties.length + agencies.length);
    expect(new Set(urls).size).toBe(entries.length);
    expect(urls.every((url) => url.startsWith(SITE_URL))).toBe(true);
  });

  it("permite rastreo y referencia el sitemap", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it("genera datos estructurados sin reseñas ni afirmaciones de disponibilidad", () => {
    const property = properties[0];
    const agency = agencies.find((item) => item.id === property.agencyId);
    expect(agency).toBeDefined();

    const data = propertyJsonLd(property, agency!);
    expect(data).toMatchObject({
      "@type": "Product",
      name: property.title,
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: "COP",
      },
    });
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data.offers).not.toHaveProperty("availability");
  });

  it("genera perfiles de agencia con ubicación colombiana", () => {
    const data = agencyJsonLd(agencies[0]);

    expect(data).toMatchObject({
      "@type": "RealEstateAgent",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CO",
      },
    });
  });

  it("serializa JSON-LD sin permitir cierre de script inyectado", () => {
    const serialized = serializeJsonLd({ value: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
  });

  it("incluye todas las imágenes locales y la tarjeta social", () => {
    const publicDir = path.resolve(process.cwd(), "public");
    const imagePaths = new Set(properties.flatMap((property) => property.images));
    imagePaths.add("/og.png");

    expect(
      [...imagePaths].every((image) =>
        fs.existsSync(path.join(publicDir, image.replace(/^\//, ""))),
      ),
    ).toBe(true);
  });
});
