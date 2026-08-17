# Context

## Now

- **Sprint:** `Autogestión multi-inmobiliaria`
- **Objective:** `Permitir administrar perfiles y propiedades con aislamiento, moderación e imágenes almacenadas en PostgreSQL.`
- **P1:** `Autogestión multi-inmobiliaria` — completada
- **P2:** `Preparación operativa para producción` — en curso

## State

- Los cuatro SPECs del MVP están completos y verificados.
- La aplicación genera 17 rutas: inicio, catálogo, 8 propiedades, 3 agencias, 404, robots y sitemap.
- La suite contiene 21 pruebas; lint, TypeScript, build y auditoría de dependencias pasan.
- La experiencia fue auditada en 390×844 y 1440×1000 sin desbordamiento ni errores de consola.
- Persistencia, mapas reales, envío de formularios y despliegue siguen fuera del alcance actual.
- La ampliación de autogestión fue aprobada con PostgreSQL local, SQL tradicional y confianza progresiva.
- SPEC005 completado con 27 pruebas totales, incluidas 4 integraciones reales con PostgreSQL.
- SPEC006 completado con edición de perfil aislada y auditoría transaccional.
- SPEC007 completado con CRUD, WebP `bytea`, entrega ETag y catálogo dinámico desde PostgreSQL.
- SPEC008 completado con confianza progresiva, moderación y auditoría inmutable.
- La suite contiene 42 pruebas; lint, TypeScript, build y auditoría de dependencias pasan.
- El flujo de miembro y administrador fue validado en navegador sin errores de consola.
- `landlords` contiene la operación local y `landlords_test` aísla las pruebas de integración.
- SPEC009 completado con invitaciones de un solo uso, recuperación Better Auth y outbox PostgreSQL.
- El correo funciona en `preview` local y por SMTP; los cuerpos sensibles se redactan después de entregar.
- La suite contiene 50 pruebas; lint, TypeScript, build de 20 rutas y auditoría de dependencias pasan.
- Recuperación, acceso administrativo e invitación inválida fueron validados en navegador sin errores.
- GitFlow usa `main` para producción, `develop` para integración y prefijos estándar para ramas de trabajo.
- El cierre de 2026-08-17 pasó lint, tipos, 29 pruebas locales, build de 20 rutas y auditoría con cero vulnerabilidades; 21 integraciones PostgreSQL quedaron omitidas sin `RUN_DB_TESTS=1`.

## Next

- Definir y ensayar respaldo y restauración de PostgreSQL, incluidos los binarios.
- Rotar credenciales locales antes de cualquier exposición en red.
- Elegir proveedor SMTP, verificar dominio remitente y ensayar entregabilidad real.
- Elegir despliegue, dominio y monitoreo.
- Configurar protección remota para `main` y `develop` antes de incorporar más colaboradores.
- Definir proveedor de despliegue y dominio cuando el MVP vaya a publicarse.
- Cerrar cada SPEC solo cuando sus criterios de aceptación sean verificables.

## History

- 2026-07-22: `NORTH inicializado directamente en nivel 5 a solicitud del usuario.`
- 2026-07-22: `MVP completado por SPECs: inicio y datos; catálogo; detalles y agencias; SEO y calidad.`
- 2026-07-22: `Cierre verificado con 21 pruebas, build de 17 rutas y auditoría responsive.`
- 2026-07-23: `Aprobada autogestión con PostgreSQL único, imágenes bytea y SQL tradicional.`
- 2026-07-23: `SPEC005 a SPEC008 completados y verificados con 42 pruebas y flujos reales de panel.`
- 2026-07-23: `SPEC009 completado con 50 pruebas, SMTP local controlado y flujos visibles validados.`
- 2026-08-17: `GitFlow configurado y trabajo separado en commits de infraestructura, seguridad, SPECs y documentación.`
