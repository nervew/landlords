# Limitaciones conocidas

## Defectos confirmados

### Edición de una propiedad rechazada

`updateProperty` limpia `rejection_reason`, pero solo cambia a `draft` cuando el
estado previo es `published` o `pending_review`. Si el estado es `rejected`, intenta
conservarlo sin razón y contradice la restricción SQL que exige una razón para todo
rechazo. Resultado esperado: la actualización falla en PostgreSQL.

Corrección recomendada: incluir `rejected` en la transición automática a `draft` y
añadir una prueba de integración que edite y reenvíe una propiedad rechazada.

## Capacidades deliberadamente incompletas

- `owner` y `editor` no tienen permisos diferenciados.
- No existe rate limiting para autenticación, recuperación, invitaciones o formularios.
- No hay CSP ni cabeceras de seguridad específicas configuradas por la aplicación.
- No hay proveedor de mapas, analítica, observabilidad ni gestión de incidentes.
- No hay almacenamiento externo de imágenes; backups de PostgreSQL incluyen `bytea`.
- No existe workflow de CI versionado en `.github/workflows/`.
- La moderación no asigna responsables ni tiempos objetivo.
- El formulario de contacto público no persiste ni envía solicitudes desde la plataforma.

## Pendientes operativos

- Elegir infraestructura, dominio, TLS y política de red.
- Configurar SMTP real y verificar el dominio remitente.
- Ensayar respaldo y restauración con binarios PostgreSQL compatibles.
- Configurar monitoreo y alertas.
- Rotar todas las credenciales antes de exponer servicios.
- Proteger `main` y `develop` en GitHub.

Los pendientes priorizados viven en `NORTH/BACKLOG.md`; este archivo explica su
impacto técnico o de usuario.
