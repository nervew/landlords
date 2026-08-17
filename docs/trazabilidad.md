# Trazabilidad

La tabla conecta contratos NORTH con implementación, evidencia y diagramas. No implica
que cada SPEC tenga cobertura exclusiva o completa.

| SPEC | Alcance | Implementación principal | Evidencia | Diagramas |
| --- | --- | --- | --- | --- |
| SPEC001 | Base técnica, datos e inicio | `src/app/page.tsx`, `src/data/`, layout | Build; cobertura indirecta | Navegación, componentes |
| SPEC002 | Catálogo, búsqueda y filtros | catálogo, filtros, tarjetas | `src/spec002.test.ts` | Navegación, casos de uso |
| SPEC003 | Detalles y agencias | rutas dinámicas, SEO, contacto | Build y cobertura indirecta | Navegación, casos de uso |
| SPEC004 | SEO, accesibilidad y calidad | sitemap, robots, JSON-LD | `src/spec004.test.ts` | Navegación |
| SPEC005 | PostgreSQL, auth y aislamiento | auth, actor, pool, migraciones, agencias | `src/spec005.test.ts` | ERD, componentes, confianza |
| SPEC006 | Panel de inmobiliarias | panel, perfil, validación | `src/spec006.test.ts` | Navegación, casos de uso |
| SPEC007 | Propiedades e imágenes | repositorio, Sharp, medios, catálogo DB | `src/spec007.test.ts` | Flujo, ERD, estados |
| SPEC008 | Confianza y moderación | workflow, moderación, auditoría | `src/spec008.test.ts` | Flujo, estados, casos de uso |
| SPEC009 | Invitaciones, recuperación y SMTP | invitaciones, Better Auth, outbox | `src/spec009.test.ts` | Secuencias, estados, confianza |

## Decisiones relacionadas

- ADR-004: autogestión multi-inmobiliaria.
- ADR-005: PostgreSQL y SQL tradicional.
- ADR-006: Better Auth y autorización cerca de los datos.
- ADR-007: confianza progresiva.
- ADR-008: SMTP y outbox PostgreSQL.
- ADR-009: GitFlow.

Consulte `NORTH/DECISIONS.md` para contexto, alternativas y consecuencias.

## Brechas de evidencia

- SPEC001 y SPEC003 no tienen suites dedicadas.
- Las 21 pruebas PostgreSQL no se ejecutan en el test local predeterminado.
- No hay workflow de CI de aplicación versionado.
- Los recorridos de navegador documentados en NORTH no están automatizados en el repo.
- No existe prueba para editar y reenviar una propiedad rechazada; hoy ese flujo falla.

Estas brechas deben convertirse en backlog o criterios de un SPEC antes de afirmar
cobertura completa.
