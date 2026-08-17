# Flujo de ramas

- `main` representa producción y `develop` integra el siguiente release.
- Crear `feature/*` y `bugfix/*` desde `develop`; sus pull requests apuntan a `develop`.
- Crear `release/*` desde `develop` y cerrarlas contra `main` y `develop`.
- Crear `hotfix/*` desde `main` y cerrarlas contra `main` y `develop`.
- No registrar funcionalidad directamente en `main` o `develop`.
- Antes de modificar archivos para una tarea nueva, confirmar que la rama y su base cumplen este flujo.
