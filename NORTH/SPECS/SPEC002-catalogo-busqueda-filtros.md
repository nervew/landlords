# SPEC002: Catálogo, búsqueda y filtros

- **ID:** SPEC002
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-22
- **Última actualización:** 2026-07-22
- **ADRs relacionados:** ADR-001, ADR-002, ADR-003
- **ADRs extraídos de este SPEC:** ninguno
- **Viability origen:** `VIABILITY/_approved/2026-07-22-plataforma-vitrina-inmobiliaria.md`

---

## 🎯 Objetivo

Permitir explorar propiedades mediante tarjetas, búsqueda, filtros combinables y
ordenamiento sin recargar toda la página.

## 🚫 Non-goals

- No ejecutar búsquedas en servidor ni base de datos.
- No guardar preferencias ni alertas.
- No implementar geobúsqueda ni búsqueda por mapa.

## 👤 User stories

- Como comprador, quiero filtrar por ubicación, tipo, precio, área y uso para reducir resultados.
- Como comprador, quiero ordenar por relevancia, fecha o precio para comparar opciones.
- Como usuario sin coincidencias, quiero comprender por qué no hay resultados y limpiar filtros.

## 📐 Contratos

### Parámetros de URL

| Parámetro | Propósito |
|---|---|
| `q` | Municipio, departamento o texto libre |
| `departamento` | Departamento |
| `municipio` | Municipio |
| `tipo` | Tipo de propiedad |
| `precioMin`, `precioMax` | Rango de precio |
| `areaMin`, `areaMax` | Rango de área |
| `uso` | Uso recomendado |
| `destacada` | Solo propiedades destacadas |
| `orden` | Relevancia, fecha, precio ascendente o descendente |

## 🔄 Flujos principales

### Filtrar resultados

1. El catálogo carga todos los fixtures o parámetros recibidos desde inicio.
2. Cada cambio actualiza el estado y los resultados sin navegación completa.
3. El contador, las tarjetas y la URL reflejan el conjunto actual.

### Restablecer filtros

1. El usuario activa `Limpiar filtros`.
2. Se restablecen controles y URL.
3. Se muestran nuevamente todas las propiedades.

## ⚠️ Edge cases y manejo de errores

- Rango mínimo superior al máximo: normalizar o impedir la combinación inválida.
- Unidades `m2` y `hectareas`: comparar con una unidad normalizada.
- Parámetro desconocido: ignorarlo sin romper la vista.
- Cero resultados: mostrar estado vacío y acción para limpiar filtros.
- Carga inicial: mostrar skeletons sin cambios bruscos de layout.

## 🏗️ Decisiones arquitectónicas implícitas

- Representar filtros compartibles en query string → decisión menor al implementar.
- Normalizar áreas para comparar unidades distintas → decisión menor al implementar.

## 🧪 Criterios de aceptación

- [x] Tarjetas muestran imagen, título, precio, ubicación, área, tipo, agencia y etiquetas.
- [x] Búsqueda y todos los filtros requeridos producen resultados correctos.
- [x] El ordenamiento funciona por precio, fecha y relevancia.
- [x] Los filtros se aplican sin recarga completa.
- [x] La vista es usable en móvil y escritorio.
- [x] Existen skeleton y estado vacío accesibles.
- [x] Pruebas cubren combinaciones principales y limpieza de filtros.
