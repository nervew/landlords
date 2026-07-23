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
