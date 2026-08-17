# SPEC007: Propiedades e imágenes en PostgreSQL

- **ID:** SPEC007
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-23
- **Última actualización:** 2026-07-23
- **ADRs relacionados:** ADR-004, ADR-005, ADR-006
- **ADRs extraídos de este SPEC:** ninguno
- **Viability origen:** `VIABILITY/_approved/2026-07-23-autogestion-inmobiliarias-postgresql.md`

---

## 🎯 Objetivo

Permitir crear, editar y retirar propiedades, incluyendo imágenes optimizadas
almacenadas como binarios `bytea`.

## 🚫 Non-goals

- No conservar originales después de generar las variantes.
- No admitir videos, SVG ni cargas superiores a 10 MB.

## 📐 Contratos

- Entrada: JPEG, PNG o WebP.
- Persistencia: variante WebP principal y miniatura con MIME, dimensiones, bytes, tamaño y SHA-256.
- Entrega: `/media/[id]` con `ETag`, caché y validación del estado público.
- Estados: `draft`, `pending_review`, `published`, `rejected`, `archived`.

## 🧪 Criterios de aceptación

- [x] CRUD valida propiedad de la inmobiliaria.
- [x] Las cargas inválidas se rechazan antes de persistir.
- [x] Las variantes se guardan y leen desde PostgreSQL.
- [x] Las imágenes no publicadas no son públicas.
- [x] Crear propiedad y medios es transaccional.
- [x] Pruebas cubren serialización, límites, permisos y entrega HTTP.
