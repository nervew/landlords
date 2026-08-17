# Desarrollo y calidad

## Requisitos

- Node.js 24.
- npm con `package-lock.json` respetado.
- PostgreSQL 17 o superior para persistencia e integraciones.
- Docker Compose v2 como alternativa reproducible.

La instalación y los comandos de base están en el [README principal](../README.md).

## Flujo Git

- `main`: producción.
- `develop`: integración del siguiente release.
- `feature/*` y `bugfix/*`: nacen de `develop` y vuelven mediante pull request.
- `release/*`: se integra en `main` y `develop`.
- `hotfix/*`: nace de `main` y vuelve a `main` y `develop`.

Los commits usan emoji y Conventional Commits. Las reglas completas están en
`.claude/rules/gitflow.md` y `.claude/rules/commits.md`.

## Verificación local

| Comando | Verifica |
| --- | --- |
| `npm run lint` | Reglas ESLint y Next.js. |
| `npm run typecheck` | Contratos TypeScript sin emitir archivos. |
| `npm test` | Pruebas unitarias y de componentes; integraciones se omiten por defecto. |
| `npm run build` | Compilación de producción y generación de rutas. |
| `npm audit` | Vulnerabilidades conocidas del árbol npm. |

Snapshot del 2026-08-17: 29 pruebas locales pasan y 21 integraciones PostgreSQL se
omiten sin `RUN_DB_TESTS=1`; build genera 20 rutas y auditoría reporta cero
vulnerabilidades. Los números pueden cambiar: el criterio es el resultado actual de
los comandos, no esta cifra histórica.

## Pruebas PostgreSQL

Use exclusivamente una base aislada llamada `landlords_test` o equivalente. Nunca
active `RUN_DB_TESTS=1` si `DATABASE_URL` apunta a la base operativa.

Variables mínimas:

```text
DATABASE_URL=postgresql://<rol-restringido>@127.0.0.1:5432/landlords_test
BETTER_AUTH_SECRET=<secreto-local-de-32-o-mas-caracteres>
BETTER_AUTH_URL=http://localhost:3000
RUN_DB_TESTS=1
SEED_MEMBER_PASSWORD=<clave-de-la-semilla-de-prueba>
```

Las integraciones crean y eliminan usuarios, membresías, invitaciones, outbox y datos
de dominio. Una base con nombre correcto no basta: compruebe host y credenciales.

## Estrategia de pruebas

- `spec002`: filtros y catálogo.
- `spec004`: sitemap, SEO, accesibilidad estructural y archivos críticos.
- `spec005`: autorización y base PostgreSQL.
- `spec006`: perfil y aislamiento.
- `spec007`: imágenes, CRUD, medios y catálogo dinámico.
- `spec008`: confianza, moderación y auditoría.
- `spec009`: invitaciones, recuperación y SMTP.

SPEC001 y SPEC003 no tienen archivos de prueba dedicados; su comportamiento aparece
parcialmente cubierto por otras suites y el build. Se registra como brecha de
trazabilidad, no como cobertura completa.

## Cambios de esquema

1. Añada una migración secuencial nueva; no edite una aplicada.
2. Actualice scripts o semilla si el esquema lo exige.
3. Añada pruebas negativas y positivas contra una base vacía.
4. Ejecute migración como administrador y runtime como rol restringido.
5. Actualice ERD, modelo de datos, SPEC y NORTH.

## Cambios de documentación

- Toda ruta nueva actualiza navegación y referencia de rutas.
- Toda tabla o relación nueva actualiza ERD y modelo de datos.
- Toda transición nueva actualiza flujo y estados.
- Todo servicio externo nuevo actualiza componentes, despliegue y seguridad.
- Verifique enlaces relativos y renderizado Mermaid antes del PR.

## Definición de terminado

- Alcance y criterios de aceptación claros.
- Autorización aplicada cerca de los datos.
- Entradas validadas y errores sin secretos.
- Migraciones reproducibles y append-only.
- Pruebas proporcionales al riesgo.
- Lint, tipos, pruebas, build y auditoría pasan.
- Documentación y NORTH reflejan el resultado.
- Pull request hacia `develop` con impacto y verificaciones explícitas.

No hay un workflow de CI de aplicación versionado en `.github/workflows/`; hasta que
exista, la evidencia local y la revisión del PR son obligatorias.
