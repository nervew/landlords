# Viabilidad: Plataforma vitrina inmobiliaria

- **Fecha:** 2026-07-22
- **Estado:** ✅ Aprobado

---

## 💡 Propuesta

Construir un MVP web que permita descubrir lotes, fincas y terrenos en municipios
colombianos y contactar directamente a la inmobiliaria responsable.

## 🤔 Motivación

Las inmobiliarias ubicadas fuera de las grandes ciudades necesitan presentar su
inventario con contexto visual, territorial y comercial a compradores de otras regiones.
Un catálogo público reduce la fricción inicial sin introducir todavía una operación
transaccional compleja.

## 🔧 Impacto técnico

- **Módulos afectados:** aplicación web completa, sistema visual, modelos, datos simulados, búsqueda, filtros, rutas dinámicas, formularios y metadatos.
- **Dependencias nuevas:** ecosistema de Next.js y Tailwind; las imágenes externas deben tener fuentes y configuración compatibles.
- **Cambios en datos:** se introducen interfaces y fixtures locales; no hay migraciones ni persistencia.
- **Compatibilidad hacia atrás:** no existen consumidores previos; el proyecto parte de un repositorio vacío.
- **Observabilidad:** lint, typecheck, tests y build deben pasar; la consola del navegador debe permanecer sin errores.

## ⚠️ Riesgos

- Alcance visual amplio: probabilidad media, impacto alto; mitigar con componentes reutilizables y ejecución por SPEC.
- Imágenes remotas inestables o lentas: probabilidad media, impacto medio; mitigar con fuentes confiables, dimensiones y fallback.
- Filtros inconsistentes con URLs o datos: probabilidad media, impacto alto; mitigar con estado derivado, tipos cerrados y pruebas.
- Apariencia genérica: probabilidad media, impacto alto; mitigar con dirección visual colombiana y contenido localizado.
- Confusión entre datos ficticios y oferta real: probabilidad baja, impacto alto; mitigar identificando el contenido como demostrativo.

## 📊 Impacto en scope

- **¿Afecta el sprint actual?** Sí; constituye el sprint completo del MVP.
- **¿Cambia el objetivo del proyecto?** No; lo materializa.
- **¿Se puede hacer incremental o es todo-o-nada?** Sí; base e inicio, catálogo, detalles y endurecimiento pueden verificarse por separado.

## 🔀 Alternativas evaluadas

| Alternativa | Pros | Contras | Por qué se elige o descarta |
|---|---|---|---|
| MVP frontend con datos simulados | Menor dependencia, rápido de validar, cubre el brief | Sin publicación ni persistencia real | Elegida para validar experiencia y alcance |
| Plataforma full-stack desde el inicio | Operación real de inventario | Más riesgo, seguridad y decisiones sin requisitos | Descartada para este sprint |
| Landing sin catálogo funcional | Implementación pequeña | No permite buscar, filtrar ni consultar detalles | Descartada porque incumple criterios |
| No hacer nada | Sin coste técnico | No resuelve visibilidad ni contacto | Descartada |

## ✅ Recomendación

Implementar incrementalmente el MVP frontend con datos simulados y límites explícitos.
Es la opción que cumple el brief sin inventar procesos operativos aún no definidos.

## 🎯 Decisión

- **Decisión:** aprobar
- **Fecha:** 2026-07-22
- **Razón:** el usuario proporcionó objetivo, stack, entregables y criterios suficientes para una implementación acotada.
- **Próximos pasos:**
  - [x] Crear especificaciones del MVP.
  - [x] Agregar la ejecución al contexto activo.
  - [x] Mover este análisis a `_approved/`.
