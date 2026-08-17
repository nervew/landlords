# Diagrama entidad-relación

```mermaid
erDiagram
    USER ||--o{ SESSION : mantiene
    USER ||--o{ ACCOUNT : autentica
    USER ||--o| PLATFORM_ADMIN : puede_ser
    USER ||--o{ AGENCY_MEMBER : pertenece
    AGENCY ||--o{ AGENCY_MEMBER : agrupa
    AGENCY ||--o{ PROPERTY : posee
    PROPERTY ||--o{ PROPERTY_MEDIA : contiene
    AGENCY ||--o{ INVITATION : recibe
    USER ||..o{ INVITATION : referencia_logica
    USER ||..o{ AUDIT_EVENT : actor_logico
    AGENCY ||..o{ AUDIT_EVENT : contexto_logico

    USER {
        text id PK
        text name
        text email UK
        boolean emailVerified
        text image
        timestamptz createdAt
        timestamptz updatedAt
    }

    SESSION {
        text id PK
        text userId FK
        text token UK
        timestamptz expiresAt
        text ipAddress
        text userAgent
    }

    ACCOUNT {
        text id PK
        text userId FK
        text providerId
        text accountId
        text password
    }

    VERIFICATION {
        text id PK
        text identifier
        text value
        timestamptz expiresAt
    }

    PLATFORM_ADMIN {
        text user_id PK
        timestamptz created_at
    }

    AGENCY {
        text id PK
        text slug UK
        text name
        text status
        text email
        text whatsapp
        timestamptz updated_at
    }

    AGENCY_MEMBER {
        text agency_id FK
        text user_id FK
        text role
        timestamptz created_at
    }

    PROPERTY {
        text id PK
        text agency_id FK
        text slug UK
        text title
        bigint price
        text status
        text rejection_reason
        timestamptz published_at
        timestamptz updated_at
    }

    PROPERTY_MEDIA {
        text id PK
        text property_id FK
        text variant
        integer position
        text mime_type
        integer byte_size
        text sha256
        bytea content
    }

    INVITATION {
        text id PK
        text agency_id FK
        text email
        text role
        text token_hash UK
        text status
        text invited_by_user_id
        text accepted_by_user_id
        timestamptz expires_at
    }

    EMAIL_OUTBOX {
        text id PK
        text kind
        text recipient
        text status
        integer attempts
        text last_error
        timestamptz available_at
        timestamptz sent_at
    }

    AUDIT_EVENT {
        text id PK
        text actor_user_id
        text agency_id
        text entity_type
        text entity_id
        text action
        jsonb metadata
        timestamptz created_at
    }
```

`AUDIT_EVENT.actor_user_id`, `AUDIT_EVENT.agency_id` y los usuarios registrados en
`INVITATION` son referencias lógicas sin clave foránea. Esto permite conservar la
historia aunque se eliminen usuarios o agencias. `EMAIL_OUTBOX` no tiene una relación
física con `INVITATION`; ambas filas se crean en la misma transacción.
