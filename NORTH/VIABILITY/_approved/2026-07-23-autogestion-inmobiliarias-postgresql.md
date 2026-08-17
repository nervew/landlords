# Viabilidad: autogestión de inmobiliarias con PostgreSQL

- **Fecha:** 2026-07-23
- **Estado:** ✅ Aprobado

---

## 💡 Propuesta

Permitir que cada inmobiliaria gestione su perfil y propiedades desde un panel,
con PostgreSQL local como única fuente de verdad, incluyendo imágenes binarias.

## 🤔 Motivación

- Sustituir los fixtures por contenido administrable sin editar código.
- Mantener control operativo y portabilidad mediante PostgreSQL estándar.
- Permitir publicación automática solo a inmobiliarias verificadas.

## 🔧 Impacto técnico

- **Módulos afectados:** autenticación, datos públicos, panel, propiedades, imágenes y moderación.
- **Dependencias nuevas:** `pg`, Better Auth, Zod y Sharp. PostgreSQL es una dependencia operativa obligatoria.
- **Cambios en datos:** esquema SQL versionado, migración inicial de fixtures y binarios `bytea`.
- **Compatibilidad hacia atrás:** las rutas públicas se conservan; los fixtures sirven como semilla inicial.
- **Observabilidad:** auditoría persistente, endpoint de salud y comandos de migración verificables.

## ⚠️ Riesgos

- **Aislamiento incorrecto entre agencias:** alto impacto; consultas por propietario, autorización central y pruebas negativas.
- **Crecimiento de imágenes:** impacto medio; límites de carga, variantes optimizadas y métricas de tamaño.
- **Credenciales privilegiadas:** alto impacto; `root` solo inicializa y la aplicación usa un rol restringido.
- **Fallo parcial al publicar:** impacto medio; transacciones y estados explícitos.

## 📊 Impacto en scope

- **¿Afecta el sprint actual?** Sí; inicia una fase posterior al MVP.
- **¿Cambia el objetivo del proyecto?** Lo amplía de vitrina estática a plataforma administrable.
- **¿Se puede hacer incremental?** Sí: persistencia, panel, inventario y moderación son SPECs separados.

## 🔀 Alternativas evaluadas

| Alternativa | Pros | Contras | Decisión |
|---|---|---|---|
| SQL tradicional con `pg` | Control explícito, PostgreSQL portable | Más SQL manual | Elegida |
| Prisma sobre PostgreSQL | Tipado y migraciones integradas | Capa adicional no requerida | Descartada |
| Almacenamiento externo de imágenes | Menor carga en la base | Rompe la fuente única solicitada | Descartada |
| No hacer nada | Sin complejidad nueva | El contenido sigue requiriendo código | Descartada |

## ✅ Recomendación

Implementar con `pg`, migraciones SQL y un rol de aplicación restringido. Guardar
imágenes optimizadas en `bytea` con metadatos, hash y límites de tamaño.

## 🎯 Decisión

- **Decisión:** aprobar
- **Fecha:** 2026-07-23
- **Razón:** el usuario eligió autogestión, confianza progresiva, PostgreSQL único y SQL tradicional.
- **Próximos pasos:**
  - [x] Crear SPEC005 a SPEC008.
  - [x] Agregar la fase a `CONTEXT.md`.
  - [x] Mantener este archivo en `_approved/`.
