import { z } from "zod";

const phonePattern = /^[+\d][\d\s()-]{6,24}$/;
const whatsappPattern = /^\d{10,15}$/;

export const agencyProfileSchema = z.object({
  agencyId: z.string().min(1),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(40).max(1_200),
  department: z.string().trim().min(2).max(80),
  municipality: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "Escribe un teléfono válido."),
  whatsapp: z
    .string()
    .trim()
    .regex(whatsappPattern, "WhatsApp debe contener entre 10 y 15 dígitos."),
  email: z.string().trim().email().max(160),
});

export type AgencyProfileInput = z.infer<typeof agencyProfileSchema>;
