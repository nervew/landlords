import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { agencies } from "@/data/agencies";
import { properties } from "@/data/properties";
import { getRelatedProperties } from "@/lib/properties";
import { createWhatsAppUrl, normalizePhone } from "@/lib/whatsapp";
import { InquiryForm } from "@/components/properties/inquiry-form";
import { PropertyGallery } from "@/components/properties/property-gallery";

describe("SPEC003: detalles y agencias", () => {
  it("genera enlaces válidos y codifica el mensaje de WhatsApp", () => {
    const url = createWhatsAppUrl(
      "+57 (310) 555-0182",
      "Hola, me interesa el lote en Villa de Leyva",
    );

    expect(normalizePhone("+57 (310) 555-0182")).toBe("573105550182");
    expect(url).toBe(
      "https://wa.me/573105550182?text=Hola%2C%20me%20interesa%20el%20lote%20en%20Villa%20de%20Leyva",
    );
    expect(createWhatsAppUrl("123", "Hola")).toBeNull();
  });

  it("relaciona propiedades sin incluir la actual", () => {
    const current = properties[0];
    const related = getRelatedProperties(current, properties, 3);

    expect(related).toHaveLength(3);
    expect(related.every((property) => property.id !== current.id)).toBe(true);
    expect(related[0].department).toBe(current.department);
  });

  it("cada agencia tiene inventario y un slug único", () => {
    const slugs = new Set(agencies.map((agency) => agency.slug));

    expect(slugs.size).toBe(agencies.length);
    expect(
      agencies.every((agency) =>
        properties.some((property) => property.agencyId === agency.id),
      ),
    ).toBe(true);
  });

  it("permite recorrer la galería con botones accesibles", async () => {
    const user = userEvent.setup();
    const property = properties[0];
    render(<PropertyGallery images={property.images} alt={property.imageAlt} />);

    const secondView = screen.getByRole("button", { name: "Mostrar vista 2" });
    expect(secondView).toHaveAttribute("aria-pressed", "false");
    await user.click(secondView);
    expect(secondView).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByAltText(/Vista 2 de 3/)).toBeVisible();
  });

  it("valida y completa el formulario sin transmitir datos", async () => {
    const user = userEvent.setup();
    render(<InquiryForm propertyTitle="Lote de prueba" />);

    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Ana");
    await user.type(screen.getByRole("textbox", { name: "Correo" }), "ana@example.com");
    await user.type(screen.getByRole("textbox", { name: "Teléfono" }), "3105550101");
    await user.click(screen.getByRole("button", { name: "Solicitar información" }));

    expect(screen.getByRole("status")).toHaveTextContent("Solicitud preparada");
    expect(screen.getByRole("status")).toHaveTextContent("no se enviaron datos");
  });
});
