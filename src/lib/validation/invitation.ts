import { z } from "zod";

const normalizedEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Escribe un correo válido.")
  .max(254, "El correo es demasiado largo.")
;

export const createInvitationSchema = z.object({
  agencyId: z.string().min(1, "Selecciona una inmobiliaria."),
  email: normalizedEmail,
  role: z.enum(["owner", "editor"], {
    error: "Selecciona un rol válido.",
  }),
});

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(32, "La invitación no es válida.").max(512),
    name: z.string().trim().min(3, "Escribe tu nombre.").max(120),
    password: z
      .string()
      .min(12, "La contraseña debe tener al menos 12 caracteres.")
      .max(128, "La contraseña es demasiado larga."),
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
