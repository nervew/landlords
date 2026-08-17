# Operación y despliegue

## Estado actual

El repositorio ofrece ejecución local directa y Docker Compose. No existe un proveedor
de producción seleccionado. El [diagrama de despliegue](./diagramas/despliegue.md)
describe la topología disponible.

## Servicios Docker

| Servicio | Función | Ciclo |
| --- | --- | --- |
| `db` | PostgreSQL 17 y volumen persistente. | Continuo |
| `db-init` | Crea rol y base, migra y carga semilla. | Una ejecución |
| `app` | Next.js standalone. | Continuo |
| `mailpit` | SMTP y bandeja local. | Continuo |

`app` espera que `db-init` termine correctamente. El Compose es de desarrollo: expone
puertos y usa Mailpit, por lo que no debe publicarse directamente en Internet.

## Variables de entorno

| Variable | Consumidor | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Aplicación, semilla y pruebas | Rol restringido sobre la base objetivo. |
| `BETTER_AUTH_URL` | Better Auth | URL base del servicio. |
| `BETTER_AUTH_SECRET` | Better Auth | Firma y seguridad de autenticación. |
| `NEXT_PUBLIC_SITE_URL` | SEO e invitaciones | URLs canónicas y enlaces públicos. |
| `EMAIL_DELIVERY_MODE` | Outbox | `preview` fuera de producción o `smtp`. |
| `SMTP_URL` | Nodemailer | Conexión al proveedor de correo. |
| `EMAIL_FROM` | Nodemailer | Remitente visible. |
| `POSTGRES_ADMIN_URL` | Setup | Crear base y rol; nunca runtime. |
| `DATABASE_ADMIN_URL` | Migraciones | Aplicar DDL; nunca runtime. |
| `APP_DATABASE_NAME` | Setup | Nombre de base. |
| `APP_DATABASE_USER` | Setup/migración | Rol restringido. |
| `APP_DATABASE_PASSWORD` | Setup | Clave del rol. |
| `SEED_ADMIN_PASSWORD` | Semilla | Cuenta administrativa local. |
| `SEED_MEMBER_PASSWORD` | Semilla/pruebas | Cuenta miembro local. |

Los correos de semilla pueden sobrescribirse con `SEED_ADMIN_EMAIL` y
`SEED_MEMBER_EMAIL`. Nunca registre valores reales en documentación o logs.

## Arranque local

Consulte el [README principal](../README.md) para comandos completos. Secuencia lógica:

1. Crear variables locales desde el ejemplo.
2. Preparar base y rol restringido.
3. Aplicar migraciones con credencial administrativa.
4. Cargar semilla con `DATABASE_URL` restringido.
5. Iniciar la aplicación.

## Secuencia de despliegue candidata

Esta secuencia es una guía; todavía no se ha ensayado en producción.

1. Aprovisionar PostgreSQL privado con backups y cifrado en reposo.
2. Crear rol de migración y rol de aplicación separados.
3. Configurar secretos fuera de la imagen.
4. Ejecutar migraciones como tarea única y verificar checksums.
5. Desplegar la imagen standalone sin publicar PostgreSQL.
6. Configurar TLS, dominio y URL canónica.
7. Configurar SMTP real y probar invitación y recuperación.
8. Ejecutar smoke tests de catálogo, login, medio, panel y moderación.
9. Activar monitoreo, alertas y revisión de outbox.

## Respaldo

No hay RPO ni RTO aprobados. Como mínimo, el respaldo debe incluir todo PostgreSQL,
porque también contiene imágenes y outbox.

Ejemplo de respaldo lógico en PowerShell:

```powershell
$backup = "landlords-$(Get-Date -Format yyyyMMdd-HHmmss).dump"
pg_dump --format=custom --no-owner --no-acl --file=$backup $env:DATABASE_ADMIN_URL
pg_restore --list $backup
```

El archivo contiene datos sensibles. Cífrelo, limite acceso y aplique retención.

## Restauración de ensayo

Nunca ensaye sobre `landlords`. Prepare una base vacía y aislada, por ejemplo
`landlords_restore_test`, y use una URL administrativa específica:

```powershell
pg_restore --dbname=$env:RESTORE_DATABASE_URL --no-owner --no-acl $env:BACKUP_FILE
```

Después de restaurar:

1. Compare `schema_migrations` con el repositorio.
2. Compruebe conteos de usuarios, agencias, propiedades y medios.
3. Verifique `octet_length(content) = byte_size`.
4. Ejecute login, catálogo y recuperación sin enviar correo real.
5. Registre duración, resultado y versión de PostgreSQL.

El procedimiento no se considera operativo hasta completar un ensayo documentado.

## Monitoreo mínimo

- Disponibilidad y latencia HTTP.
- Errores 5xx y fallos de autenticación agregados, sin credenciales.
- Conexiones, espacio, locks y crecimiento de PostgreSQL.
- Tamaño de `property_media` y backups.
- Mensajes `failed` o `processing` estancados en outbox.
- Tamaño y antigüedad de la cola `pending_review`.
- Fallo de migración y discrepancia de checksum.

## Rollback

- La aplicación puede volver a una imagen anterior solo si el esquema sigue siendo
  compatible.
- No existen migraciones `down`; los cambios de esquema se corrigen hacia adelante.
- Antes de una migración incompatible se necesita backup verificado y plan explícito.
- No use `docker compose down -v` salvo que quiera eliminar de forma irreversible el
  volumen local.

## Respuesta inicial a incidentes

1. Contener: retirar acceso público o suspender la operación afectada.
2. Preservar evidencia: logs, eventos de auditoría y snapshot de base.
3. Rotar secretos si pudo existir exposición.
4. Identificar entidades y usuarios afectados.
5. Corregir, restaurar o desplegar hacia adelante.
6. Documentar causa, impacto, tiempos y acción preventiva.
