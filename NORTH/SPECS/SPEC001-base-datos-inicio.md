# SPEC001: Base técnica, datos e inicio

- **ID:** SPEC001
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-22
- **Última actualización:** 2026-07-22
- **ADRs relacionados:** ADR-001, ADR-002, ADR-003
- **ADRs extraídos de este SPEC:** ninguno
- **Viability origen:** `VIABILITY/_approved/2026-07-22-plataforma-vitrina-inmobiliaria.md`

---

## 🎯 Objetivo

Crear la base Next.js tipada, el sistema visual colombiano, los datos demostrativos
y una página de inicio responsive que conduzca al catálogo.

## 🚫 Non-goals

- No implementar persistencia, autenticación ni panel administrativo.
- No integrar mapas, formularios transaccionales ni servicios externos.
- No afirmar que agencias, propiedades o documentación están verificadas legalmente.

## 👤 User stories

- Como comprador, quiero entender la propuesta y buscar por ubicación o tipo para comenzar a explorar.
- Como visitante móvil, quiero una navegación sencilla y llamadas a la acción visibles.
- Como inmobiliaria, quiero comprender cómo la plataforma puede exhibir mis propiedades.

## 📐 Contratos

### Rutas

| Ruta | Propósito |
|---|---|
| `/` | Inicio, búsqueda, destacados, municipios, funcionamiento y confianza |
| `/propiedades` | Destino inicial del buscador y tarjetas destacadas |

### Modelos de datos

```ts
interface Property {
  id: string; slug: string; title: string; description: string;
  price: number; currency: "COP";
  propertyType: "lote" | "finca" | "terreno-rural" | "terreno-urbano";
  department: string; municipality: string; address?: string;
  area: number; areaUnit: "m2" | "hectareas";
  intendedUse: string[]; services: string[]; roadAccess: string;
  images: string[]; featured: boolean; negotiable: boolean;
  publishedAt: string; agencyId: string;
}

interface Agency {
  id: string; name: string; slug: string; logo: string; description: string;
  department: string; municipality: string; phone: string;
  whatsapp: string; email: string; verified: boolean;
}
```

## 🔄 Flujos principales

### Búsqueda desde inicio

1. El usuario escribe municipio, departamento o elige tipo.
2. La acción navega a `/propiedades` con parámetros legibles.
3. El catálogo interpreta los parámetros y muestra coincidencias.

### Exploración de destacados

1. El usuario recorre propiedades y municipios destacados.
2. Abre el catálogo o una propiedad mediante enlaces semánticos.

## ⚠️ Edge cases y manejo de errores

- Consulta vacía: abrir el catálogo completo.
- Imagen ausente o fallida: mostrar fallback con texto alternativo útil.
- Datos demostrativos: incluir aviso claro sin degradar la experiencia.

## 🏗️ Decisiones arquitectónicas implícitas

- Usar rutas y renderizado de Next.js para contenido indexable → cubierto por ADR-001.
- Mantener fixtures tipados fuera de componentes → cubierto por ADR-002.

## 🧪 Criterios de aceptación

- [x] Proyecto Next.js, TypeScript y Tailwind inicializado sin errores.
- [x] Existen al menos 8 propiedades y 3 inmobiliarias ficticias en módulos separados.
- [x] Inicio incluye todas las secciones requeridas y funciona en móvil y escritorio.
- [x] Búsqueda del hero conduce al catálogo con parámetros interpretables.
- [x] Precios usan formato `es-CO` y moneda `COP`.
- [x] Componentes base son reutilizables y accesibles por teclado.
- [x] Typecheck, lint y build pasan.
