# Raíz de Pueblo

Vitrina y plataforma de autogestión para inmobiliarias locales de Colombia.
El catálogo público, los usuarios, las sesiones, las propiedades, la auditoría
y las imágenes se almacenan en PostgreSQL.

## Stack

- Next.js 16, React 19, TypeScript y Tailwind CSS 4.
- PostgreSQL con SQL versionado y el driver `pg`; no utiliza ORM.
- Better Auth con cuentas y sesiones persistentes.
- Sharp para convertir imágenes a WebP antes de guardarlas como `bytea`.
- Vitest y Testing Library.

## Requisitos

- Node.js 24.
- PostgreSQL 17 o superior.
- Una cuenta administrativa de PostgreSQL para crear la base y ejecutar migraciones.

La aplicación nunca debe conectarse como `postgres` o cualquier otro
superusuario.

## Ejecución con Docker Compose

El paquete levanta cuatro servicios:

- `db`: PostgreSQL 17 con datos persistentes en un volumen.
- `db-init`: crea el rol restringido, aplica migraciones y carga la semilla.
- `app`: compilación de producción de Next.js en `http://localhost:3000`.
- `mailpit`: SMTP local y bandeja de correo en `http://localhost:8025`.

Requisito: Docker Engine o Docker Desktop con Compose v2.

1. Crea el archivo de configuración:

   ```powershell
   Copy-Item .env.docker.example .env.docker
   ```

2. Reemplaza las cinco claves demostrativas de `.env.docker`. Las claves de
   PostgreSQL deben usar caracteres seguros para URL: letras, números, guiones y
   guiones bajos. Si cambias `APP_PORT`, actualiza también `SITE_URL`.

3. Construye e inicia todo el paquete:

   ```bash
   docker compose --env-file .env.docker up --build
   ```

   En el primer arranque, `app` espera a que PostgreSQL esté sano y a que
   `db-init` termine correctamente. Correos iniciales de la semilla:

   - Administrador: `admin@raizdepueblo.local`.
   - Inmobiliaria: `agencia@raizdepueblo.local`.

   Sus contraseñas son `SEED_ADMIN_PASSWORD` y `SEED_MEMBER_PASSWORD`.

Comandos operativos:

```bash
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f app
docker compose --env-file .env.docker down
```

`down` conserva PostgreSQL. Para borrar también la base y repetir la
inicialización desde cero, usa `docker compose --env-file .env.docker down -v`;
esta última operación elimina el volumen de forma irreversible.

Este Compose está preparado para desarrollo local. Antes de exponerlo en red se
deben sustituir Mailpit por un SMTP real, cerrar el puerto público de PostgreSQL,
rotar secretos y definir TLS, copias de seguridad y monitoreo.

## Configuración local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env.local` y reemplaza todos los valores
   demostrativos. `BETTER_AUTH_SECRET` debe ser aleatorio y tener al menos
   32 caracteres.

3. Prepara la base y el rol restringido. Ejemplo en PowerShell:

   ```powershell
   $env:POSTGRES_ADMIN_URL="postgresql://postgres:tu-clave@127.0.0.1:5432/postgres"
   $env:APP_DATABASE_NAME="landlords"
   $env:APP_DATABASE_USER="landlords_app"
   $env:APP_DATABASE_PASSWORD="una-clave-larga-y-aleatoria"
   npm run db:setup
   ```

   Copia el `DATABASE_URL` resultante a `.env.local`.

4. Ejecuta las migraciones:

   ```powershell
   $env:DATABASE_ADMIN_URL="postgresql://postgres:tu-clave@127.0.0.1:5432/landlords"
   $env:APP_DATABASE_USER="landlords_app"
   npm run db:migrate
   ```

5. Carga la demostración y crea las cuentas iniciales:

   ```powershell
   $env:SEED_ADMIN_PASSWORD="una-clave-de-12-caracteres-o-mas"
   $env:SEED_MEMBER_PASSWORD="otra-clave-de-12-caracteres-o-mas"
   npm run db:seed
   ```

   Correos predeterminados:

   - Administrador: `admin@raizdepueblo.local`.
   - Inmobiliaria: `agencia@raizdepueblo.local`.

6. Inicia la aplicación:

   ```bash
   npm run dev
   ```

   Abre `http://localhost:3000`.

## Correo transaccional

Invitaciones y recuperación usan una bandeja de salida PostgreSQL. El mensaje se
persiste antes del intento de entrega y nunca se guarda la clave SMTP.

Desarrollo local:

```dotenv
EMAIL_DELIVERY_MODE=preview
```

Los administradores pueden abrir el mensaje desde `/panel/accesos`. Este modo no
envía correo y está bloqueado en producción.

Entrega real:

```dotenv
EMAIL_DELIVERY_MODE=smtp
SMTP_URL=smtps://usuario:clave-codificada@smtp.proveedor.com:465
EMAIL_FROM=Raíz de Pueblo <no-responder@tu-dominio.com>
```

Si el usuario o la clave contienen caracteres reservados deben codificarse para
URL. Un fallo queda en `email_outbox` y puede reintentarse desde el panel. Después
de entregar, el cuerpo que contenía el enlace de un solo uso se redacta.

## Administración de contenido

- `/iniciar-sesion`: autenticación.
- `/panel`: resumen y estado de confianza.
- `/panel/perfil`: edición del perfil de inmobiliaria.
- `/panel/propiedades`: creación, edición, archivo y envío a publicación.
- `/panel/moderacion`: verificación de agencias, moderación y auditoría; solo administradores.
- `/panel/accesos`: invitaciones, roles y bandeja de salida; solo administradores.
- `/recuperar-contrasena`: solicitud con respuesta que no revela si la cuenta existe.
- `/aceptar-invitacion`: alta o asociación de una cuenta mediante enlace de un solo uso.

Flujo de confianza:

- `pending`: las propiedades pasan a revisión.
- `verified`: las propiedades se publican directamente.
- `suspended`: se bloquean nuevos envíos; el inventario ya publicado no se elimina.

## Imágenes

Cada archivo JPEG, PNG o WebP:

1. Se valida con un límite de 10 MB.
2. Se convierte a variante WebP de presentación y miniatura.
3. Se persiste en `property_media.content` como `bytea`, junto con dimensiones,
   MIME, tamaño y SHA-256.
4. Se entrega mediante `/media/[id]` con `ETag` y caché HTTP.

No se guarda Base64 ni se utiliza almacenamiento externo. Esto simplifica la
fuente de verdad, pero aumenta el tamaño de PostgreSQL y sus copias de seguridad.

## Verificación

Validación sin infraestructura adicional:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

Las pruebas de integración requieren una base separada:

```powershell
$env:DATABASE_URL="postgresql://landlords_app:clave@127.0.0.1:5432/landlords_test"
$env:BETTER_AUTH_SECRET="secreto-local-de-al-menos-32-caracteres"
$env:BETTER_AUTH_URL="http://localhost:3000"
$env:RUN_DB_TESTS="1"
$env:SEED_MEMBER_PASSWORD="clave-usada-en-la-semilla"
npm test
```

## Estructura principal

```text
database/migrations/       # Esquema SQL append-only
scripts/                   # Preparación, migración y semilla
src/app/                   # Rutas públicas, autenticación y panel
src/lib/repositories/      # SQL y autorización cerca de los datos
src/lib/media/             # Validación y serialización de imágenes
src/lib/validation/        # Contratos Zod
NORTH/                     # Viabilidad, decisiones, backlog y SPECs
```

## Alcance

El contenido inicial es ficticio. La plataforma no certifica tradición,
propiedad, uso del suelo ni estado jurídico. La verificación de una inmobiliaria
habilita un flujo editorial; no equivale a validación legal.
