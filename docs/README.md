# Documentación de Landlords

Este directorio explica el producto, su uso y su implementación. Describe el estado
de la rama actual; no presenta como terminadas las capacidades operativas pendientes.

## Lectura por audiencia

| Audiencia | Empiece por | Continúe con |
| --- | --- | --- |
| Negocio o producto | [Producto y alcance](./producto.md) | [Guía de usuario](./guia-de-usuario.md) |
| Inmobiliaria | [Guía de usuario](./guia-de-usuario.md) | [Glosario](./glosario.md) |
| Desarrollo | [Arquitectura](./arquitectura.md) | [Desarrollo y calidad](./desarrollo-y-calidad.md) |
| Datos | [Modelo de datos](./modelo-de-datos.md) | [Entidad-relación](./diagramas/entidad-relacion.md) |
| Seguridad | [Modelo de seguridad](./seguridad.md) | [Límites de confianza](./diagramas/limites-de-confianza.md) |
| Operaciones | [Operación y despliegue](./operacion-y-despliegue.md) | [Despliegue](./diagramas/despliegue.md) |
| QA o revisión | [Trazabilidad](./trazabilidad.md) | [Limitaciones conocidas](./limitaciones-conocidas.md) |

## Documentación no técnica

- [Producto y alcance](./producto.md): problema, actores, valor, límites y estado.
- [Guía de usuario](./guia-de-usuario.md): recorridos de visitantes, miembros y administradores.
- [Glosario](./glosario.md): términos del negocio y estados visibles.

## Documentación técnica

- [Arquitectura](./arquitectura.md): capas, dependencias y decisiones de diseño.
- [Modelo de datos](./modelo-de-datos.md): tablas, invariantes y propiedad de datos.
- [Modelo de seguridad](./seguridad.md): autenticación, autorización y riesgos pendientes.
- [Desarrollo y calidad](./desarrollo-y-calidad.md): GitFlow, pruebas y definición de terminado.
- [Operación y despliegue](./operacion-y-despliegue.md): configuración, migración, respaldo y producción.
- [Referencia de rutas](./referencia-de-rutas.md): páginas, handlers y autorización.
- [Trazabilidad](./trazabilidad.md): relación entre SPECs, código, pruebas y diagramas.
- [Limitaciones conocidas](./limitaciones-conocidas.md): fallos y capacidades aún no implementadas.
- [Diagramas](./diagramas/README.md): índice visual completo.

## Fuentes de verdad

1. Las migraciones en `database/migrations/` definen el esquema efectivo.
2. El código en `src/` define el comportamiento implementado.
3. `NORTH/SPECS/` y `NORTH/DECISIONS.md` explican contratos y decisiones.
4. Esta carpeta traduce esos hechos para distintas audiencias.

Si existe una contradicción, se corrige primero el comportamiento o contrato y luego
se actualiza la documentación en el mismo pull request.

## Estado operativo

La aplicación funciona localmente con Node.js y PostgreSQL o mediante Docker Compose.
No hay proveedor de producción, dominio, TLS, SMTP real, copias verificadas ni
monitoreo configurados. Consulte [operación y despliegue](./operacion-y-despliegue.md).
