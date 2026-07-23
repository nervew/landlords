# SPEC003: Detalles de propiedades y agencias

- **ID:** SPEC003
- **Estado:** ✅ Completo
- **Fecha creación:** 2026-07-22
- **Última actualización:** 2026-07-22
- **ADRs relacionados:** ADR-001, ADR-002, ADR-003
- **ADRs extraídos de este SPEC:** ninguno
- **Viability origen:** `VIABILITY/_approved/2026-07-22-plataforma-vitrina-inmobiliaria.md`

---

## 🎯 Objetivo

Ofrecer páginas amigables por slug con información suficiente para evaluar una
propiedad, conocer la inmobiliaria y establecer contacto directo.

## 🚫 Non-goals

- No verificar identidad, propiedad ni documentación legal.
- No enviar formularios a un backend real.
- No integrar un proveedor de mapas en esta versión.
- No reservar, separar ni pagar propiedades.

## 👤 User stories

- Como comprador, quiero revisar fotos, características y contexto legal disponible antes de contactar.
- Como comprador móvil, quiero abrir WhatsApp con un mensaje correcto y prellenado.
- Como visitante, quiero conocer la agencia y explorar su inventario publicado.

## 📐 Contratos

### Rutas

| Ruta | Propósito |
|---|---|
| `/propiedades/[slug]` | Detalle de una propiedad |
| `/inmobiliarias/[slug]` | Perfil e inventario de una inmobiliaria |

### Contacto por WhatsApp

```text
https://wa.me/<numero-normalizado>?text=<mensaje-codificado>
```

El número contiene solo dígitos y el mensaje identifica la propiedad y su URL.

## 🔄 Flujos principales

### Contactar por WhatsApp

1. El usuario abre una propiedad.
2. El botón genera teléfono normalizado y mensaje codificado.
3. WhatsApp abre en una pestaña o aplicación compatible.

### Consultar una inmobiliaria

1. El usuario sigue el enlace de agencia desde una tarjeta o detalle.
2. El perfil muestra identidad, ubicación, contacto, estado demostrativo e inventario.

## ⚠️ Edge cases y manejo de errores

- Slug inexistente: responder con página 404.
- Teléfono inválido: no generar enlace roto; ofrecer medios alternativos disponibles.
- Agencia sin propiedades: mostrar estado vacío.
- Campo legal ausente: indicar `Información no suministrada`, no inferir validez.
- Galería con una imagen: conservar navegación accesible sin controles inútiles.

## 🏗️ Decisiones arquitectónicas implícitas

- Generar rutas estáticas a partir de fixtures para el MVP → decisión menor al implementar.
- Centralizar normalización y enlaces de WhatsApp → decisión menor al implementar.

## 🧪 Criterios de aceptación

- [x] Cada propiedad ficticia tiene una URL amigable y detalle completo.
- [x] Cada inmobiliaria tiene perfil, contacto e inventario.
- [x] Galería y contenido funcionan con teclado y lectores de pantalla.
- [x] El botón de WhatsApp permanece visible en móvil y genera URL válida.
- [x] El formulario tiene etiquetas, validación y comportamiento demostrativo claro.
- [x] Propiedades relacionadas excluyen la propiedad actual.
- [x] Slugs inexistentes muestran 404 sin errores de consola.
