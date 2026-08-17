import { z } from "zod";

const list = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().min(2).max(100)).max(20));

export const propertyInputSchema = z.object({
  agencyId: z.string().min(1),
  propertyId: z.string().optional(),
  title: z.string().trim().min(8).max(150),
  description: z.string().trim().min(80).max(3_000),
  price: z.coerce.number().int().min(0).max(99_999_999_999),
  propertyType: z.enum(["lote", "finca", "terreno-rural", "terreno-urbano"]),
  department: z.string().trim().min(2).max(80),
  municipality: z.string().trim().min(2).max(80),
  address: z.string().trim().max(180).optional(),
  area: z.coerce.number().positive().max(10_000_000),
  areaUnit: z.enum(["m2", "hectareas"]),
  intendedUse: list,
  services: list,
  roadAccess: z.string().trim().min(10).max(500),
  imageAlt: z.string().trim().min(10).max(250),
  highlights: list,
  legalInfo: list,
  negotiable: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;
