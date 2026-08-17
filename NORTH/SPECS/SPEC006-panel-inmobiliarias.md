# SPEC006: Panel de inmobiliarias

- **ID:** SPEC006
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-23
- **Última actualización:** 2026-07-23
- **ADRs relacionados:** ADR-004, ADR-006
- **ADRs extraídos de este SPEC:** ninguno
- **Viability origen:** `VIABILITY/_approved/2026-07-23-autogestion-inmobiliarias-postgresql.md`

---

## 🎯 Objetivo

Ofrecer un panel accesible donde cada inmobiliaria consulte su estado y edite su
perfil sin afectar datos ajenos.

## 🚫 Non-goals

- No administrar inventario ni verificación en este SPEC.
- No permitir cambiar desde el panel el estado de confianza.

## 👤 User stories

- Como miembro, quiero ver el resumen de mi inmobiliaria y actualizar contacto y descripción.
- Como miembro suspendido, quiero comprender que no puedo publicar.

## 🧪 Criterios de aceptación

- [x] `/panel` muestra resumen, estado y navegación administrativa.
- [x] `/panel/perfil` valida y persiste solo campos editables.
- [x] La pertenencia se valida nuevamente en cada mutación.
- [x] Los estados vacíos y errores son comprensibles y accesibles.
- [x] Pruebas cubren lectura, actualización válida y acceso cruzado rechazado.
