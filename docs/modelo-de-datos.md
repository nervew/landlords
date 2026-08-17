# Modelo de datos

PostgreSQL es la fuente de verdad para identidad, contenido, imágenes, invitaciones,
correo y auditoría. No se usa ORM. Consulte el
[diagrama entidad-relación](./diagramas/entidad-relacion.md).

## Migraciones

| Archivo | Responsabilidad |
| --- | --- |
| `001_auth.sql` | Tablas de Better Auth: usuario, sesión, cuenta y verificación. |
| `002_domain.sql` | Inmobiliarias, membresías, propiedades, medios y auditoría. |
| `003_audit_immutability.sql` | Elimina FKs históricas de auditoría para preservar eventos. |
| `004_invitations_email_outbox.sql` | Invitaciones y bandeja de salida de correo. |

Las migraciones son append-only. `db-migrate.mjs` calcula SHA-256 y rechaza una
migración aplicada cuyo contenido cambió.

## Identidad

- `user`: identidad y correo único.
- `account`: credencial o proveedor asociado al usuario.
- `session`: token, expiración y metadatos de cliente.
- `verification`: valores temporales usados por Better Auth.
- `platform_admins`: usuarios con alcance global.

## Multi-inmobiliaria

- `agencies`: perfil y estado de confianza.
- `agency_members`: relación muchos-a-muchos entre usuario y agencia.
- El par `(agency_id, user_id)` es único.
- `role` admite `owner` y `editor`, aunque la aplicación aún no diferencia permisos.

## Propiedades y medios

- `properties` pertenece obligatoriamente a una agencia.
- `slug` es único y la moneda se restringe a `COP`.
- Precio no negativo; área positiva; tipos y estados están restringidos por `CHECK`.
- `property_media` contiene variantes `display` y `thumbnail` en WebP.
- `(property_id, position, variant)` es único.
- `octet_length(content)` debe coincidir con `byte_size`.
- El SHA-256 del contenido se usa como ETag.

Estados de propiedad: `draft`, `pending_review`, `published`, `rejected` y
`archived`. Una propiedad `rejected` exige `rejection_reason` no nula.

## Invitaciones

- El correo se normaliza a minúsculas.
- Solo puede existir una invitación pendiente por agencia y correo.
- En base se guarda `token_hash`, nunca el token de invitación en claro.
- Una invitación pendiente tiene vencimiento posterior a su creación.
- Los estados persistidos son `pending`, `accepted` y `revoked`; `expired` se calcula.
- Los identificadores de quien invita o acepta son referencias históricas sin FK.

## Outbox de correo

- Tipos: `invitation`, `password_reset` y `email_verification`.
- Estados: `pending`, `processing`, `sent`, `failed` y `preview`.
- Máximo de cinco intentos.
- Un mensaje enviado exige `sent_at`; uno no enviado no puede tenerlo.
- Después de entrega SMTP, los cuerpos se reemplazan por texto redactado.
- En modo `preview`, el cuerpo sensible permanece disponible para prueba local.

## Auditoría

`audit_events` registra actor, agencia, tipo e identificador de entidad, acción,
metadatos y fecha. Un trigger rechaza `UPDATE` y `DELETE`. Actor y agencia son texto
sin FK para impedir que una eliminación rompa la historia.

La inmutabilidad en base no sustituye controles de retención, acceso a backups o
minimización de datos personales.

## Propiedad y autorización

La pertenencia se resuelve desde `agency_members`. Los repositorios comprueban que el
actor sea administrador o contenga la agencia antes de leer o mutar datos privados.
Las consultas públicas filtran por `properties.status = 'published'`.

## Evolución del esquema

1. Crear una migración nueva con prefijo secuencial.
2. No modificar migraciones aplicadas.
3. Añadir restricciones e índices junto con su caso de uso.
4. Actualizar semilla, repositorios, pruebas, ERD y esta referencia.
5. Validar desde una base vacía y desde una base con migraciones anteriores.
