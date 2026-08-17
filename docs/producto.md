# Producto y alcance

## Qué es

Landlords, presentado al usuario como **Raíz de Pueblo**, es una vitrina para que
inmobiliarias locales de Colombia publiquen lotes, fincas y terrenos. Un comprador
puede descubrir propiedades y contactar directamente a la inmobiliaria; la plataforma
no intermedia pagos ni certifica la situación legal del inmueble.

## Problema que resuelve

- El inventario rural suele estar disperso entre mensajes, redes y archivos privados.
- Un comprador de otra región necesita comparar oferta, ubicación y datos de contacto.
- La inmobiliaria necesita actualizar su perfil e inventario sin editar código.
- La plataforma necesita moderar participantes nuevos sin bloquear indefinidamente a
  quienes ya demostraron confianza.

## Actores

| Actor | Objetivo principal |
| --- | --- |
| Visitante | Buscar, evaluar y contactar por un inmueble publicado. |
| Miembro de inmobiliaria | Mantener el perfil y administrar el inventario propio. |
| Administrador de plataforma | Gestionar confianza, moderación, accesos y auditoría. |
| Persona invitada | Crear o asociar una cuenta mediante un enlace de un solo uso. |

Los valores `owner` y `editor` se almacenan en cada membresía, pero todavía no
producen permisos distintos en la aplicación.

## Capacidades actuales

- Catálogo con búsqueda, filtros, orden y páginas de detalle.
- Perfil público por inmobiliaria y contacto directo.
- Sesiones persistentes y recuperación de contraseña con Better Auth.
- Aislamiento de datos por inmobiliaria.
- Edición de perfil y CRUD de propiedades.
- Imágenes WebP almacenadas en PostgreSQL.
- Confianza progresiva: `pending`, `verified` y `suspended`.
- Moderación, invitaciones, outbox de correo y auditoría inmutable.
- SEO mediante metadatos, datos estructurados, robots y sitemap dinámico.

## Fuera de alcance actual

- Pagos, reservas, comisiones o contratos.
- Certificación jurídica, de tradición, uso del suelo o identidad real.
- Chat interno, CRM, analítica o mapas reales.
- Registro público sin invitación.
- Almacenamiento externo de medios.
- Aplicaciones móviles nativas.
- Operación productiva completa.

## Reglas de publicación

- Una inmobiliaria nueva queda `pending`; sus envíos requieren moderación.
- Una inmobiliaria `verified` publica directamente.
- Una inmobiliaria `suspended` no puede enviar nuevas publicaciones.
- Suspender no retira automáticamente propiedades ya publicadas.
- Rechazar una propiedad exige una razón de al menos diez caracteres.
- Cada transición sensible deja un evento de auditoría.

## Indicadores a observar cuando exista producción

No hay objetivos numéricos aprobados. Como mínimo deben medirse disponibilidad,
errores, tiempo en cola de moderación, entrega de correo, crecimiento de PostgreSQL y
resultado de restauraciones. Cualquier meta futura debe quedar en NORTH antes de
presentarse como compromiso de producto.
