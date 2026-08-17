# CLAUDE.md

> north_skill_version: 4.0
> north_level: 5

## Proyecto

`Landlords es una vitrina web para que inmobiliarias de pueblos de Colombia promocionen lotes, fincas y terrenos a compradores de otras regiones.`

## Preferencias

- **Idioma:** `es`
- **Estilo de respuesta:** `directo, analítico, conciso y sin relleno`
- **Modo consultivo:** `preguntar cuando exista ambigüedad real, riesgo o alcance poco claro`
- **Implementación:** `cambios quirúrgicos, componentes reutilizables y objetivos verificables`

## 🧭 NORTH

`/north` al inicio de cada sesión. El proyecto usa NORTH nivel 5.

| Comando | Qué hace |
|---|---|
| `/north` | Briefing de estado, sincronización y drift |
| `/north next` | Prioridad actual y razón |
| `/north compact` | Comprime contexto preservando decisiones y código |
| `/north heal` | Valida estructura, tamaño y versión |
| `/north resume` | Retoma pendientes antiguos |

- Contexto activo en `NORTH/CONTEXT.md`.
- Decisiones append-only en `NORTH/DECISIONS.md`.
- Trabajo pendiente en `NORTH/BACKLOG.md`.
- Cambios grandes en `NORTH/VIABILITY/`.
- Contratos de implementación en `NORTH/SPECS/`.
- Reglas del proyecto en `.claude/rules/`.
- Commits con emoji y Conventional Commits.
