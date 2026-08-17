# Diagrama de flujo de publicación

```mermaid
flowchart TD
    Inicio["Miembro inicia sesión"] --> Actor["Resolver sesión, rol y agencias"]
    Actor --> Formulario["Crear o editar propiedad"]
    Formulario --> Validar["Validar campos con Zod"]
    Validar --> ValidaCampos{"¿Datos válidos?"}
    ValidaCampos -->|No| ErrorFormulario["Mostrar errores sin persistir"]
    ValidaCampos -->|Sí| Imagenes["Validar JPEG, PNG o WebP; máximo 5 archivos de 10 MB"]
    Imagenes --> ValidaImagen{"¿Imágenes válidas?"}
    ValidaImagen -->|No| ErrorImagen["Rechazar operación"]
    ValidaImagen -->|Sí| Transformar["Sharp genera display y thumbnail WebP"]
    Transformar --> Transaccion["Transacción: propiedad, medios y auditoría"]
    Transaccion --> Borrador["Estado draft"]
    Borrador --> Enviar["Enviar a publicación"]
    Enviar --> Autorizar["Validar pertenencia y bloquear filas"]
    Autorizar --> EstadoAgencia{"Estado de inmobiliaria"}
    EstadoAgencia -->|suspended| Bloqueado["Bloquear envío"]
    EstadoAgencia -->|verified| Publicada["Estado published"]
    EstadoAgencia -->|pending| Revision["Estado pending_review"]
    Revision --> Decision{"Decisión de administrador"}
    Decision -->|Aprobar| Publicada
    Decision -->|Rechazar con razón| Rechazada["Estado rejected"]
    Rechazada --> Formulario
    Publicada --> Catalogo["Visible en catálogo, sitemap y medios"]
    Transaccion -.-> Auditoria["audit_events append-only"]
    Enviar -.-> Auditoria
    Decision -.-> Auditoria
```

Una inmobiliaria suspendida conserva publicaciones existentes, pero no puede enviar
nuevas propiedades. La edición de una publicación o revisión la devuelve a borrador.
Existe una incidencia conocida al editar una propiedad rechazada; se documenta en
[limitaciones conocidas](../limitaciones-conocidas.md).
