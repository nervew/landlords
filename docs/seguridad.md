# Modelo de seguridad

## Objetivos

- Evitar acceso entre inmobiliarias.
- Evitar registro público no invitado.
- No exponer contraseñas, tokens, credenciales SMTP ni contenido privado.
- Mantener trazabilidad de cambios sensibles.
- Ejecutar la aplicación con un rol PostgreSQL no privilegiado.

Vea el [diagrama de límites de confianza](./diagramas/limites-de-confianza.md).

## Autenticación

- Better Auth administra contraseñas, sesiones y recuperación.
- Contraseñas: entre 12 y 128 caracteres.
- Sesión: siete días; se actualiza como máximo una vez al día.
- La recuperación responde de forma genérica, aunque el correo no exista.
- Cambiar contraseña revoca sesiones previas y registra auditoría.
- `sign-up` permanece técnicamente habilitado, pero un middleware exige invitación
  vigente y correo coincidente.

No se deben asumir atributos concretos de cookies más allá de lo configurado por
Better Auth y el entorno; deben verificarse al preparar producción.

## Autorización

- `getCurrentActor` une sesión, administración global y membresías.
- `assertAgencyAccess` limita cada operación a agencias permitidas.
- `assertPlatformAdmin` protege moderación, confianza, invitaciones y outbox.
- Las comprobaciones viven en repositorios y se repiten en Server Actions.
- Los roles de membresía `owner` y `editor` aún no cambian permisos.

El riesgo principal es un acceso directo que evite los repositorios. Todo nuevo acceso
SQL de dominio debe incluir explícitamente su decisión de autorización.

## Base de datos y secretos

- `DATABASE_URL` usa el rol restringido de runtime.
- Las credenciales administrativas se reservan para setup y migraciones.
- Las consultas de repositorio parametrizan valores.
- Nombres de base y rol usados en setup se validan antes de interpolarse.
- Los ejemplos de entorno contienen placeholders; archivos reales se ignoran en Git.
- Backups contienen cuentas, PII, imágenes y correo; deben tratarse como secretos.

TLS, cifrado en reposo, segmentación de red y rotación son responsabilidades del
despliegue y todavía no están configurados en este repositorio.

## Invitaciones y correo

- El token de invitación tiene 32 bytes aleatorios y se busca por SHA-256.
- Vence en siete días y solo puede consumirse una vez.
- Cuenta existente: correo de sesión e invitación deben coincidir.
- Cuenta nueva: una cabecera interna vincula el alta con el token validado.
- SMTP se configura por variable de entorno; la credencial no se persiste.
- Nodemailer tiene deshabilitado el acceso a archivos y URLs desde el mensaje.
- Los errores almacenados se reducen a códigos saneados.
- Los cuerpos se redactan después del envío, pero no mientras están pendientes o en
  vista previa.

## Imágenes

- Solo JPEG, PNG o WebP.
- Máximo 10 MB por archivo y cinco imágenes por operación.
- Sharp vuelve a decodificar, rota y convierte a WebP.
- Se guarda SHA-256, dimensiones y tamaño; una restricción verifica los bytes.
- `/media/[id]` solo entrega medios de propiedades publicadas, añade `nosniff`, ETag y
  caché inmutable.

El límite de bytes no es un límite de megapíxeles. Antes de producción conviene añadir
un límite explícito de dimensiones o píxeles para reducir riesgo de descompresión.

## Auditoría

- Las transiciones sensibles escriben `audit_events` en la misma transacción.
- Base de datos impide actualizar o eliminar eventos.
- Los eventos pueden contener correo o razones de rechazo en metadatos.
- No existe aún política de retención, exportación ni revisión periódica.

## Controles pendientes antes de producción

- Rate limiting y protección contra abuso.
- Verificación de cookies, HTTPS, cabeceras y CSP en el entorno final.
- Gestión central de secretos y rotación.
- Aislamiento de PostgreSQL y eliminación de su puerto público.
- SMTP real con dominio verificado.
- Backups cifrados y restauraciones ensayadas.
- Monitoreo, alertas y redacción de logs.
- Revisión de dependencia y escaneo continuo.
- Corrección de las incidencias en [limitaciones conocidas](./limitaciones-conocidas.md).
