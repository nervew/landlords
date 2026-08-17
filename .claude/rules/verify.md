# Verificación

Para cambios de aplicación ejecutar, en este orden:

```text
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

- Las pruebas PostgreSQL requieren `RUN_DB_TESTS=1` y una base aislada `landlords_test`.
- Si cambian migraciones, autenticación, repositorios o correo, ejecutar también las integraciones con PostgreSQL cuando el servicio esté disponible.
- No usar la base operativa para pruebas destructivas.
