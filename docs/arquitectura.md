# Arquitectura

## Resumen

La aplicación es un monolito modular de Next.js 16 con App Router. Renderiza la
experiencia pública y el panel, ejecuta lógica de servidor y accede a una única base
PostgreSQL mediante SQL parametrizado. Better Auth gestiona identidad; Sharp procesa
imágenes y Nodemailer entrega correo.

Vea los diagramas de [componentes](./diagramas/componentes.md),
[despliegue](./diagramas/despliegue.md) y
[límites de confianza](./diagramas/limites-de-confianza.md).

## Capas

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Rutas | `src/app/` | Páginas, layouts, metadatos, handlers y Server Actions. |
| Presentación | `src/components/` | Formularios, catálogo, navegación y componentes cliente. |
| Autenticación | `src/lib/auth.ts`, `src/lib/auth/` | Better Auth, sesión, actor y restricciones de registro. |
| Validación | `src/lib/validation/` | Contratos Zod para entradas de dominio. |
| Dominio y acceso | `src/lib/repositories/` | SQL, autorización, transacciones y mapeo de filas. |
| Medios | `src/lib/media/` | Validación, conversión WebP, metadatos y hash. |
| Correo | `src/lib/email/` | Plantillas, outbox, SMTP, reintentos y redacción. |
| Persistencia | `src/lib/db/`, `database/migrations/` | Pool `pg`, transacciones y esquema versionado. |
| Operación | `scripts/`, `Dockerfile`, `compose.yaml` | Setup, migración, semilla y entorno local reproducible. |

## Límites cliente-servidor

- Los componentes con `"use client"` manejan interacción y Better Auth cliente.
- Las credenciales, el pool, SQL, Sharp y SMTP viven solo en servidor.
- Las mutaciones usan Server Actions; no hay una API REST de dominio pública.
- `/api/auth/[...all]` pertenece a Better Auth.
- `/media/[id]` entrega bytes únicamente si la propiedad está publicada.

## Lectura pública

1. Una ruta pública llama `public-content.ts`.
2. El repositorio selecciona solo propiedades `published` y agencias visibles.
3. Los medios se representan como `/media/[id]`.
4. El handler vuelve a comprobar el estado publicado y responde con ETag y caché.

Las colecciones en `src/data/` ya no son fuente de verdad en runtime; sirven como
entrada de la semilla local.

## Mutación administrativa

1. El layout o la acción resuelve el `Actor` desde la sesión.
2. Zod valida y normaliza la entrada.
3. El repositorio comprueba `platformAdmin` o pertenencia a la inmobiliaria.
4. La escritura de dominio y su evento de auditoría se ejecutan en una transacción.
5. La ruta afectada se revalida y la UI recibe un estado seguro.

## Transacciones relevantes

- Perfil de inmobiliaria y auditoría.
- Propiedad, variantes de imagen y auditoría.
- Transición de publicación y auditoría.
- Moderación y auditoría.
- Invitación, outbox y auditoría.
- Consumo de invitación y membresía.

La creación de usuario por Better Auth usa su propio acceso al pool durante el flujo de
invitación. Si falla la asociación posterior, el código intenta eliminar la cuenta sin
membresías; no equivale a una única transacción distribuida.

## Decisiones principales

- PostgreSQL y SQL tradicional evitan un ORM y conservan consultas explícitas.
- `bytea` mantiene una única fuente de verdad, a costa de backups más grandes.
- La autorización reside en repositorios para reducir accesos directos inseguros.
- Confianza progresiva equilibra autonomía y moderación.
- La outbox evita perder correo antes del intento de entrega.
- GitFlow separa integración (`develop`) y producción (`main`).

El razonamiento completo está en `NORTH/DECISIONS.md` y `NORTH/VIABILITY/`.

## Dependencias externas

| Dependencia | Uso | Fallo esperado |
| --- | --- | --- |
| PostgreSQL | Toda la persistencia | La aplicación no puede servir datos ni autenticar. |
| SMTP | Invitaciones y recuperación | El mensaje queda fallido y reintentable en outbox. |
| WhatsApp/correo/teléfono | Contacto público | El usuario sale de la aplicación. |

## Deuda arquitectónica visible

- No hay diferenciación efectiva entre `owner` y `editor`.
- No hay rate limiting, observabilidad ni CI versionado.
- El despliegue productivo y la restauración todavía no están ensayados.
- Consulte [limitaciones conocidas](./limitaciones-conocidas.md).
