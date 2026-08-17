# Decisions

## Minor

- 2026-07-22: `Las rutas dinámicas del MVP se generan desde los fixtures.` Razón: `obtener URLs indexables sin introducir una fuente de datos productiva`.
- 2026-07-22: `Los teléfonos y mensajes de WhatsApp se generan desde una utilidad central.` Razón: `evitar enlaces inconsistentes o inválidos entre tarjetas y detalles`.
- 2026-07-22: `Los filtros compartibles se representan en la query string.` Razón: `permitir enlaces reproducibles sin introducir estado global ni backend`.
- 2026-07-22: `Las áreas se normalizan a metros cuadrados para filtrar.` Razón: `comparar de forma coherente inmuebles expresados en m2 y hectáreas`.
- 2026-07-22: `Los precios se presentan con locale es-CO y moneda COP.` Razón: `el público y los inmuebles objetivo están en Colombia`.
- 2026-07-22: `El contenido ficticio debe identificarse como demostrativo.` Razón: `evitar afirmaciones legales o certificaciones inexistentes`.

## ADRs

## ADR-001: Construir el MVP con Next.js, TypeScript y Tailwind CSS

- **Fecha:** 2026-07-22
- **Estado:** Aceptada
- **Contexto:** El repositorio no contiene una aplicación previa ni un stack que preservar. El brief exige una experiencia web responsive, tipada, reutilizable y preparada para SEO.
- **Decisión:** Usar `Next.js`, `TypeScript` y `Tailwind CSS` como base del MVP.
- **Consecuencias:** Se obtiene renderizado apropiado para SEO, rutas dinámicas y tipado estático; a cambio, el proyecto queda acoplado a las convenciones y actualizaciones de Next.js.
- **Alternativas consideradas:** Mantener HTML estático se descarta por filtros y rutas dinámicas; otros frameworks se descartan porque el stack fue definido explícitamente en el brief.

## ADR-002: Separar los datos demostrativos de la interfaz

- **Fecha:** 2026-07-22
- **Estado:** Aceptada
- **Contexto:** La primera versión necesita al menos 8 propiedades y 3 inmobiliarias, pero aún no existe una fuente de datos productiva.
- **Decisión:** Definir interfaces TypeScript y mantener propiedades e inmobiliarias simuladas en módulos independientes de los componentes.
- **Consecuencias:** La interfaz puede construirse y probarse sin backend, y la fuente podrá sustituirse después; a cambio, no habrá persistencia ni edición real en el MVP.
- **Alternativas consideradas:** Datos incrustados en componentes se descartan por duplicación; crear un backend ahora se descarta por ampliar el alcance sin requisitos de persistencia.

## ADR-003: Limitar el MVP a descubrimiento y contacto directo

- **Fecha:** 2026-07-22
- **Estado:** Aceptada
- **Contexto:** El objetivo indicado es exhibir inmuebles y facilitar el contacto con el vendedor. El brief no define transacciones, autenticación, administración ni verificación legal.
- **Decisión:** Implementar navegación, búsqueda, filtros, perfiles, formulario demostrativo y enlaces de WhatsApp; excluir pagos, cuentas, panel de publicación y validación legal real.
- **Consecuencias:** El MVP conserva un alcance entregable y reduce riesgos de seguridad y cumplimiento; a cambio, las inmobiliarias no podrán administrar inventario desde la aplicación.
- **Alternativas consideradas:** Una plataforma transaccional completa se descarta por requerir procesos legales, seguridad y backend no definidos; un catálogo sin contacto se descarta porque no cumple el objetivo comercial.

## ADR-004: Ampliar la vitrina con autogestión multi-inmobiliaria

- **Fecha:** 2026-07-23
- **Estado:** Aceptada; amplía ADR-003 después del cierre del MVP.
- **Contexto:** El contenido está en fixtures y cada cambio requiere editar código. El usuario eligió que cada inmobiliaria administre su información.
- **Decisión:** Añadir autenticación, panel, pertenencia por inmobiliaria, inventario y moderación sin convertir la plataforma en un sistema transaccional.
- **Consecuencias:** El contenido será administrable, pero aparecen obligaciones de seguridad, persistencia, auditoría y operación.
- **Alternativas consideradas:** CMS central y hoja de cálculo se descartan porque no ofrecen la autonomía elegida.

## ADR-005: Usar PostgreSQL y SQL tradicional como única persistencia

- **Fecha:** 2026-07-23
- **Estado:** Aceptada
- **Contexto:** El usuario dispone de PostgreSQL local y solicita almacenar allí todos los datos, incluidas las imágenes.
- **Decisión:** Usar `pg`, migraciones SQL versionadas y columnas `bytea`; no introducir Prisma ni almacenamiento de objetos.
- **Consecuencias:** El esquema y las consultas son explícitos y portables. Se requiere mantener SQL, límites de medios y copias de seguridad más grandes.
- **Alternativas consideradas:** Prisma se descarta por ser una abstracción no requerida; almacenamiento externo se descarta porque rompería la fuente única solicitada.

## ADR-006: Autenticar con Better Auth y autorizar cerca de los datos

- **Fecha:** 2026-07-23
- **Estado:** Aceptada
- **Contexto:** Implementar contraseñas, sesiones y revocación desde cero aumenta riesgo sin diferenciar el producto.
- **Decisión:** Usar Better Auth con PostgreSQL para identidad y sesiones. Centralizar autorización en la capa de acceso a datos y validar actor, rol y pertenencia en cada operación.
- **Consecuencias:** Se evita criptografía propia y todas las sesiones permanecen en PostgreSQL; la seguridad depende también de consultas parametrizadas y pruebas negativas.
- **Alternativas consideradas:** Autenticación artesanal se descarta por riesgo; proveedores externos se descartan porque añadirían otra fuente de datos.

## ADR-007: Publicar mediante confianza progresiva

- **Fecha:** 2026-07-23
- **Estado:** Aceptada
- **Contexto:** Publicación inmediata para toda agencia aumenta fraude; revisión perpetua limita autonomía.
- **Decisión:** Agencias nuevas requieren moderación, verificadas publican directamente y suspendidas no pueden enviar. Solo administradores cambian confianza.
- **Consecuencias:** Se equilibran velocidad y control, a cambio de una máquina de estados y auditoría obligatoria.
- **Alternativas consideradas:** Revisión universal y publicación universal se descartan por sus extremos operativos.

## ADR-008: Entregar correo mediante SMTP y una outbox PostgreSQL

- **Fecha:** 2026-07-23
- **Estado:** Aceptada
- **Contexto:** Invitaciones y recuperación requieren entrega externa sin convertir al proveedor en fuente de verdad ni perder mensajes ante fallos transitorios.
- **Decisión:** Persistir primero cada mensaje en `email_outbox` y entregarlo con SMTP mediante `nodemailer`; usar vista previa solo en desarrollo.
- **Consecuencias:** El proveedor puede cambiarse mediante configuración y los reintentos son auditables. Los enlaces de un solo uso existen temporalmente en la outbox y deben expirar o redactarse tras la entrega.
- **Alternativas consideradas:** Una API propietaria se descarta por acoplamiento; envío sin outbox se descarta por pérdida ante fallos; vista previa sin entrega se limita al desarrollo.

## ADR-009: Adoptar GitFlow para integrar cambios

- **Fecha:** 2026-08-17
- **Estado:** Aceptada
- **Contexto:** El repositorio necesita separar trabajo funcional, integración y producción antes de continuar acumulando cambios.
- **Decisión:** Usar `main` como rama de producción, `develop` como rama de integración y los prefijos estándar `feature/`, `bugfix/`, `release/`, `hotfix/` y `support/`; los pull requests funcionales apuntan a `develop`.
- **Consecuencias:** La intención de cada rama y destino queda explícita, pero las ramas de larga duración pueden acumular divergencia y requieren integración frecuente.
- **Alternativas consideradas:** Desarrollo directo sobre `main` y trunk-based se descartan para este flujo porque no preservan la etapa de integración solicitada.
