# SPEC009: Invitaciones y recuperación mediante correo SMTP

- **ID:** SPEC009
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-23
- **Última actualización:** 2026-07-23
- **ADRs relacionados:** ADR-005, ADR-006, ADR-008
- **ADRs extraídos de este SPEC:** ADR-008
- **Viability origen:** `VIABILITY/_approved/2026-07-23-invitaciones-recuperacion-correo-smtp.md`

---

## 🎯 Objetivo

Crear cuentas mediante invitaciones vinculadas a una inmobiliaria y permitir
restablecer contraseñas, con entrega SMTP desacoplada y una outbox PostgreSQL.

## 🚫 Non-goals

- No enviar campañas ni notificaciones comerciales.
- No administrar el proveedor SMTP desde la interfaz.
- No introducir una segunda fuente de identidad.
- No permitir registro público sin invitación.

## 📐 Contratos

- Solo un administrador de plataforma crea, revoca o reintenta invitaciones.
- La invitación vincula correo, inmobiliaria y rol; expira y se consume una sola vez.
- Aceptar una invitación enviada al correo acredita ese correo y crea la membresía.
- Una cuenta existente puede aceptar otra membresía tras autenticarse con el mismo correo.
- Better Auth genera, valida y expira los tokens de recuperación.
- La respuesta de recuperación no revela si el correo existe.
- El mensaje se guarda antes de intentar SMTP; un fallo conserva el reintento.
- `preview` es solo local; `smtp` requiere URL y remitente por variables de entorno.
- Contraseñas, secretos SMTP y tokens no aparecen en auditoría ni errores persistidos.

## 🧪 Criterios de aceptación

- [x] Migración crea `invitations` y `email_outbox` con restricciones e índices.
- [x] Registro directo sin una invitación firmada es rechazado.
- [x] Administrador crea y revoca invitaciones; un miembro no puede hacerlo.
- [x] Nueva cuenta acepta una invitación válida y obtiene su membresía.
- [x] Una cuenta existente acepta una invitación solo con sesión y correo coincidente.
- [x] Invitaciones vencidas, revocadas o consumidas son rechazadas.
- [x] Recuperación produce respuesta genérica, cambia la contraseña y revoca sesiones.
- [x] Outbox soporta `preview`, SMTP, fallo y reintento sin filtrar credenciales.
- [x] UI pública y administrativa es accesible y comunica estados sin exponer secretos.
- [x] Pruebas, lint, tipos, build y auditoría de dependencias pasan.
