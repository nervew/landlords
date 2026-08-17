# Diagrama de despliegue

## Topología disponible: Docker Compose local

```mermaid
flowchart LR
    Usuario["Navegador"] -->|"HTTP : APP_PORT"| App["app — Next.js standalone"]
    Operador["Operador local"] -->|"HTTP : MAILPIT_PORT"| MailpitUI["Mailpit UI"]

    subgraph Compose["Proyecto Docker Compose landlords"]
        App -->|"DATABASE_URL :5432"| DB[("db — PostgreSQL 17")]
        App -->|"SMTP :1025"| Mailpit["mailpit — SMTP local"]
        Mailpit --> MailpitUI
        Init["db-init — tarea de una ejecución"] -->|"crear rol, migrar y sembrar"| DB
        DB --> Volume[("postgres_data")]
    end

    Source["Código, package-lock y Dockerfile"] -->|"multi-stage build"| App
    Source -->|"target db-tools"| Init
```

`db-init` debe terminar correctamente antes de iniciar `app`. PostgreSQL puede
publicar un puerto al host para desarrollo. Esta topología no es un despliegue de
producción: carece de TLS, proveedor SMTP real, copias verificadas, monitoreo y una
política de exposición de red.
