# Diagramas del sistema

Los diagramas describen el estado implementado de la rama actual. Las propuestas
de producción no implementadas se identifican explícitamente como pendientes.

## Índice

- [Navegación](./navegacion.md): rutas públicas, autenticación y panel por rol.
- [Entidad-relación](./entidad-relacion.md): modelo PostgreSQL y relaciones lógicas.
- [Flujo de publicación](./flujo-publicacion.md): creación, envío y moderación.
- [Componentes](./componentes.md): límites entre UI, dominio, persistencia y servicios.
- [Despliegue](./despliegue.md): topología Docker Compose disponible hoy.
- [Casos de uso](./casos-de-uso.md): capacidades por actor.
- [Secuencias de identidad](./secuencias-identidad.md): invitación y recuperación.
- [Estados del dominio](./estados-del-dominio.md): agencias, propiedades, invitaciones y correo.
- [Límites de confianza](./limites-de-confianza.md): datos sensibles y cruces de seguridad.

## Convenciones

- Flecha continua: llamada o transición directa.
- Flecha punteada: efecto secundario, referencia lógica o cruce asincrónico.
- PostgreSQL es la fuente de verdad para identidad, dominio, medios y auditoría.
- `owner` y `editor` existen en datos, pero actualmente comparten permisos de aplicación.
