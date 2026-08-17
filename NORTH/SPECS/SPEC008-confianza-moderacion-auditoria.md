# SPEC008: Confianza progresiva, moderación y auditoría

- **ID:** SPEC008
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-23
- **Última actualización:** 2026-07-23
- **ADRs relacionados:** ADR-004, ADR-006, ADR-007
- **ADRs extraídos de este SPEC:** ADR-007
- **Viability origen:** `VIABILITY/_approved/2026-07-23-autogestion-inmobiliarias-postgresql.md`

---

## 🎯 Objetivo

Aplicar confianza progresiva: agencias nuevas requieren revisión y las verificadas
publican directamente, con control administrativo y trazabilidad.

## 🚫 Non-goals

- No verificar títulos de propiedad ni identidad legal automáticamente.
- No eliminar publicaciones existentes al suspender una agencia.

## 📐 Contratos

- Agencia: `pending`, `verified`, `suspended`.
- Agencia `pending`: enviar propiedad produce `pending_review`.
- Agencia `verified`: enviar propiedad produce `published`.
- Agencia `suspended`: no puede enviar ni publicar.
- Cada cambio sensible genera un evento de auditoría inmutable.

## 🧪 Criterios de aceptación

- [x] El flujo de publicación depende del estado actual de la agencia.
- [x] Solo administradores verifican, suspenden o moderan.
- [x] Suspender no elimina automáticamente publicaciones existentes.
- [x] Cada transición registra actor, entidad, acción, fecha y datos mínimos.
- [x] Pruebas cubren la matriz completa de estados y roles.
