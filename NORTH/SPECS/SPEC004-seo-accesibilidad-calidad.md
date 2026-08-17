# SPEC004: SEO, accesibilidad y calidad

- **ID:** SPEC004
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-22
- **Última actualización:** 2026-07-22
- **ADRs relacionados:** ADR-001, ADR-003
- **ADRs extraídos de este SPEC:** ninguno
- **Viability origen:** `VIABILITY/_approved/2026-07-22-plataforma-vitrina-inmobiliaria.md`

---

## 🎯 Objetivo

Endurecer el MVP para que sea indexable, accesible, rápido y verificable antes de
considerarlo completo.

## 🚫 Non-goals

- No contratar herramientas externas de analítica, monitoreo o auditoría.
- No prometer posiciones específicas en buscadores.
- No añadir certificaciones, reseñas reales ni indicadores de confianza inventados.

## 👤 User stories

- Como usuario de teclado o lector de pantalla, quiero navegar y completar formularios sin barreras.
- Como comprador que llega desde buscadores o redes, quiero una vista previa y contenido contextual correctos.
- Como mantenedor, quiero comandos reproducibles que detecten fallos antes de publicar.

## 📐 Contratos

### Metadatos

| Página | Título y descripción |
|---|---|
| Inicio | Propuesta nacional y búsqueda de terrenos |
| Catálogo | Lotes y terrenos en venta en Colombia, ajustado a filtros útiles |
| Propiedad | Tipo, municipio, departamento y atributos reales del fixture |
| Agencia | Nombre comercial, ubicación e inventario disponible |

### Datos estructurados

- Usar vocabulario apropiado solo para información presente en los fixtures.
- No marcar valoraciones, disponibilidad legal o certificaciones inexistentes.

## 🔄 Flujos principales

### Validación de entrega

1. Ejecutar lint, typecheck, pruebas y build.
2. Corregir errores y advertencias relevantes.
3. Verificar vistas móviles y de escritorio, foco, contraste y consola.

### Generación de metadatos

1. Resolver entidad por slug.
2. Construir título, descripción, canonical y Open Graph con datos reales.
3. Usar metadatos seguros por defecto si falta un campo opcional.

## ⚠️ Edge cases y manejo de errores

- Imagen Open Graph ausente: usar imagen general del sitio.
- Texto demasiado largo: truncar descripciones sin perder significado.
- JavaScript deshabilitado: conservar contenido y enlaces principales cuando sea viable.
- Preferencia de movimiento reducido: evitar animaciones no esenciales.
- Foco después de interacción: mantener orden lógico y señal visible.

## 🏗️ Decisiones arquitectónicas implícitas

- Generar metadatos desde la misma fuente tipada de contenido → decisión menor al implementar.
- Adoptar verificación automatizada como criterio de cierre → decisión menor al implementar.

## 🧪 Criterios de aceptación

- [x] Todas las rutas públicas tienen títulos y descripciones apropiados.
- [x] Propiedades generan Open Graph y datos estructurados sin afirmaciones ficticias.
- [x] HTML usa landmarks y jerarquía semántica.
- [x] Formularios, filtros, galerías y navegación funcionan con teclado.
- [x] Contraste, foco visible, textos alternativos y targets táctiles son adecuados.
- [x] No hay errores de TypeScript, lint, build ni consola.
- [x] README contiene instalación, ejecución, verificación y aviso de datos demostrativos.
- [x] Auditoría responsive cubre al menos un viewport móvil y uno de escritorio.
