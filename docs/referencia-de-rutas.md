# Referencia de rutas

## Rutas públicas

| Ruta | Propósito | Datos o control |
| --- | --- | --- |
| `/` | Inicio y propiedades destacadas. | PostgreSQL; render dinámico. |
| `/propiedades` | Catálogo, filtros y orden. | Solo propiedades publicadas. |
| `/propiedades/[slug]` | Detalle, galería y contacto. | 404 si no está publicada. |
| `/inmobiliarias/[slug]` | Perfil e inventario público. | Agencia y publicaciones. |
| `/iniciar-sesion` | Acceso al panel. | Better Auth cliente. |
| `/recuperar-contrasena` | Solicitar recuperación. | Respuesta genérica. |
| `/restablecer-contrasena` | Definir nueva contraseña. | Token temporal de Better Auth. |
| `/aceptar-invitacion` | Alta o asociación por token. | Invitación vigente y correo coincidente. |
| `/robots.txt` | Directivas para buscadores. | Generado por Next.js. |
| `/sitemap.xml` | URLs indexables. | Catálogo y agencias desde PostgreSQL. |
| `/_not-found` | Respuesta visual para contenido ausente. | Sin datos privados. |

## Panel autenticado

| Ruta | Audiencia | Propósito |
| --- | --- | --- |
| `/panel` | Miembro o administrador | Resumen de inmobiliarias permitidas. |
| `/panel/perfil` | Miembro o administrador | Editar perfil dentro del alcance. |
| `/panel/propiedades` | Miembro o administrador | Listar, archivar y enviar propiedades. |
| `/panel/propiedades/nueva` | Miembro o administrador | Crear borrador con imágenes. |
| `/panel/propiedades/[id]` | Miembro o administrador | Editar propiedad autorizada. |
| `/panel/moderacion` | Solo administrador | Confianza, cola y auditoría. |
| `/panel/accesos` | Solo administrador | Invitaciones y outbox. |

El layout del panel exige sesión. Los repositorios vuelven a validar pertenencia o
administración; ocultar un enlace no se considera autorización.

## Route Handlers

| Ruta | Métodos | Comportamiento |
| --- | --- | --- |
| `/api/auth/[...all]` | GET, POST | Endpoints generados por Better Auth. |
| `/media/[id]` | GET | WebP de propiedad publicada; ETag, `nosniff` y caché de un año. |

`/media/[id]` responde 304 si `If-None-Match` coincide y 404 si el medio no existe o
la propiedad no está publicada.

## Server Actions

| Área | Operaciones |
| --- | --- |
| Perfil | Actualizar campos editables de inmobiliaria. |
| Propiedades | Crear, editar, archivar y enviar a publicación. |
| Moderación | Cambiar confianza, aprobar y rechazar. |
| Accesos | Crear/revocar invitaciones y reintentar correo. |
| Invitación | Crear cuenta invitada o asociar cuenta existente. |

No hay API pública de dominio para terceros. Cualquier futura API debe definir
autenticación, autorización, versionado, rate limiting y contrato antes de exponerse.
