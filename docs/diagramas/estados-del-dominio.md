# Diagramas de estados del dominio

## Inmobiliaria

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> verified: administrador verifica
    pending --> suspended: administrador suspende
    verified --> suspended: administrador suspende
    suspended --> verified: administrador reactiva y verifica
    suspended --> pending: administrador devuelve a revisión
    verified --> pending: administrador devuelve a revisión
```

## Propiedad

```mermaid
stateDiagram-v2
    [*] --> draft: crear
    draft --> pending_review: enviar con agencia pending
    draft --> published: enviar con agencia verified
    pending_review --> published: aprobar
    pending_review --> rejected: rechazar con razón
    rejected --> pending_review: corregir y reenviar con agencia pending
    rejected --> published: corregir y reenviar con agencia verified
    published --> draft: editar
    pending_review --> draft: editar
    draft --> archived: archivar
    rejected --> archived: archivar
    published --> archived: archivar
    pending_review --> archived: archivar
```

La transición desde `rejected` hacia una corrección está prevista por la UI, pero
tiene una inconsistencia de implementación registrada en
[limitaciones conocidas](../limitaciones-conocidas.md).

## Invitación

```mermaid
stateDiagram-v2
    [*] --> pending: crear
    pending --> accepted: aceptar
    pending --> revoked: revocar
    pending --> expired: vence después de 7 días
    expired --> revoked: limpieza al crear reemplazo
    accepted --> [*]
    revoked --> [*]
```

`expired` es un estado calculado a partir de `expires_at`; la fila conserva `pending`
hasta que una operación la marque como `revoked`.

## Bandeja de salida

```mermaid
stateDiagram-v2
    [*] --> preview: modo local
    [*] --> pending: modo SMTP
    pending --> processing: reclamar mensaje
    failed --> processing: reintento programado o manual
    processing --> sent: entrega correcta y redacción
    processing --> failed: error y backoff
    processing --> processing: recuperar bloqueo mayor a 10 minutos
    failed --> [*]: máximo 5 intentos
    sent --> [*]
    preview --> [*]
```
