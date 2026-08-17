# Diagrama de límites de confianza

```mermaid
flowchart LR
    subgraph Public["Zona no confiable: navegador e Internet"]
        Browser["Navegador"]
        Upload["Archivos y formularios"]
        Token["Token en enlace de un solo uso"]
    end

    subgraph App["Zona de aplicación: proceso Next.js"]
        Route["Route Handlers y Server Actions"]
        Session["Better Auth y sesión"]
        Zod["Validación Zod"]
        ACL["Autorización por actor y agencia"]
        Sharp["Sharp: tipo, tamaño y conversión"]
        Secrets["Variables de entorno"]
        Outbox["Entrega de correo"]
    end

    subgraph Data["Zona de datos"]
        AppRole["Rol PostgreSQL restringido"]
        DB[("Identidad, dominio, bytea y auditoría")]
        AdminRole["Credencial administrativa solo para migración"]
    end

    SMTP["Proveedor SMTP externo"]
    Operator["Operador autorizado"]

    Browser -->|"cookies y solicitudes"| Route
    Upload --> Zod
    Upload --> Sharp
    Token -->|"se transforma a SHA-256 para buscar"| Route
    Route --> Session
    Route --> Zod
    Session --> ACL
    Zod --> ACL
    ACL --> AppRole
    Sharp --> AppRole
    AppRole --> DB
    Secrets --> Session
    Secrets --> AppRole
    Secrets --> Outbox
    Outbox -.->|"SMTP; cuerpo redactado tras envío"| SMTP
    Operator --> AdminRole
    AdminRole -->|"setup y migraciones, no runtime"| DB
```

No existe cifrado de aplicación para imágenes o datos: TLS, cifrado en reposo,
rotación de secretos y aislamiento de red son responsabilidades del entorno de
despliegue. Tampoco hay rate limiting ni monitoreo implementados actualmente.
