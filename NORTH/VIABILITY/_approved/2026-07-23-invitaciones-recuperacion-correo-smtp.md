# Viabilidad: invitaciones y recuperación mediante correo SMTP

- **Fecha:** 2026-07-23
- **Estado:** ✅ Aprobado

---

## 💡 Propuesta

Permitir que la administración invite miembros a una inmobiliaria y que cualquier
cuenta recupere su contraseña mediante correo transaccional.

## 🤔 Motivación

- Eliminar la creación manual de cuentas desde la semilla.
- Entregar accesos sin compartir contraseñas temporales.
- Recuperar cuentas sin intervención del administrador.

## 🔧 Impacto técnico

- **Módulos afectados:** autenticación, panel administrativo, PostgreSQL y correo.
- **Dependencia nueva:** `nodemailer` como cliente SMTP intercambiable.
- **Cambios en datos:** invitaciones de un solo uso y bandeja de salida persistente.
- **Compatibilidad:** las cuentas y sesiones existentes conservan su formato.
- **Operación local:** modo `preview` inspeccionable por administradores sin SMTP.

## ⚠️ Riesgos

- **Robo de enlaces:** tokens de invitación almacenados solo como SHA-256 y expiración.
- **Enumeración de usuarios:** recuperación siempre devuelve una respuesta genérica.
- **Pérdida de correos:** cada mensaje se persiste antes del intento SMTP y admite reintento.
- **Alta sin invitación:** el registro de Better Auth se habilita únicamente tras validar una
  firma interna y una invitación vigente.
- **Credenciales SMTP:** solo variables de entorno; nunca PostgreSQL, auditoría o logs.

## 🔀 Alternativas evaluadas

| Alternativa | Pros | Contras | Decisión |
|---|---|---|---|
| SMTP + outbox PostgreSQL | Portable, auditable y tolerante a fallos | Requiere configurar un proveedor | Elegida |
| API de Resend | Integración directa | Acoplamiento al proveedor | Descartada |
| Solo vista previa local | Sin servicio externo | No entrega mensajes reales | Disponible solo para desarrollo |

## 🎯 Decisión

- **Decisión:** aprobar
- **Fecha:** 2026-07-23
- **Razón:** el usuario eligió SMTP genérico y PostgreSQL como fuente de verdad.

