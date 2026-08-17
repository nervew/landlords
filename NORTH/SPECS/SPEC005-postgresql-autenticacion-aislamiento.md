# SPEC005: PostgreSQL, autenticación y aislamiento

- **ID:** SPEC005
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-23
- **Última actualización:** 2026-07-23
- **ADRs relacionados:** ADR-004, ADR-005, ADR-006
- **ADRs extraídos de este SPEC:** ADR-004, ADR-005, ADR-006
- **Viability origen:** `VIABILITY/_approved/2026-07-23-autogestion-inmobiliarias-postgresql.md`

---

## 🎯 Objetivo

Establecer PostgreSQL local, migraciones SQL, autenticación persistente y una capa
de autorización que impida acceder a datos de otra inmobiliaria.

## 🚫 Non-goals

- No implementar todavía edición visual de propiedades ni moderación completa.
- No usar ORM ni almacenar credenciales en Git.
- No permitir que la aplicación opere como superusuario.

## 👤 User stories

- Como miembro, quiero iniciar sesión y acceder solo a mi inmobiliaria.
- Como administrador, quiero gestionar todas las inmobiliarias.
- Como mantenedor, quiero reproducir el esquema mediante SQL versionado.

## 📐 Contratos

- `DATABASE_URL` conecta el rol restringido de aplicación.
- `DATABASE_ADMIN_URL` es opcional y solo ejecuta migraciones.
- Roles funcionales: `platform_admin` y `agency_member`.
- Toda operación sensible valida sesión, rol y pertenencia en la capa de datos.

## 🧪 Criterios de aceptación

- [x] Las migraciones crean el esquema desde cero en PostgreSQL.
- [x] Better Auth almacena usuarios, cuentas y sesiones en PostgreSQL.
- [x] Las rutas del panel rechazan sesiones ausentes.
- [x] Un miembro no puede leer ni modificar otra inmobiliaria.
- [x] El administrador puede operar sobre cualquier inmobiliaria.
- [x] Pruebas unitarias e integración cubren permisos positivos y negativos.
- [x] Lint, typecheck y build pasan.
