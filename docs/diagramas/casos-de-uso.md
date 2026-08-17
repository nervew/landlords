# Diagrama de casos de uso

```mermaid
flowchart LR
    Visitante["Actor: visitante"]
    Miembro["Actor: miembro de inmobiliaria"]
    Admin["Actor: administrador de plataforma"]
    Invitado["Actor: persona invitada"]
    SMTP["Sistema externo: SMTP"]

    subgraph Publicos["Descubrimiento público"]
        Buscar(["Buscar y filtrar propiedades"])
        VerPropiedad(["Ver detalle de propiedad"])
        VerAgencia(["Ver perfil de inmobiliaria"])
        Contactar(["Contactar por WhatsApp, correo o teléfono"])
    end

    subgraph Autogestion["Autogestión"]
        Ingresar(["Iniciar y cerrar sesión"])
        EditarPerfil(["Editar perfil propio"])
        GestionarPropiedad(["Crear, editar y archivar propiedades"])
        CargarImagenes(["Cargar imágenes"])
        EnviarPublicacion(["Enviar a publicación"])
        Recuperar(["Recuperar contraseña"])
    end

    subgraph Plataforma["Administración de plataforma"]
        EstadoAgencia(["Verificar o suspender inmobiliarias"])
        Moderar(["Aprobar o rechazar propiedades"])
        Invitar(["Crear o revocar invitaciones"])
        Correo(["Revisar y reintentar correo"])
        Auditoria(["Consultar auditoría"])
    end

    subgraph Alta["Alta por invitación"]
        Aceptar(["Aceptar invitación"])
        CrearCuenta(["Crear cuenta restringida"])
        Asociar(["Asociar cuenta existente"])
    end

    Visitante --> Buscar
    Visitante --> VerPropiedad
    Visitante --> VerAgencia
    Visitante --> Contactar
    Miembro --> Ingresar
    Miembro --> EditarPerfil
    Miembro --> GestionarPropiedad
    Miembro --> CargarImagenes
    Miembro --> EnviarPublicacion
    Miembro --> Recuperar
    Admin --> Ingresar
    Admin --> EstadoAgencia
    Admin --> Moderar
    Admin --> Invitar
    Admin --> Correo
    Admin --> Auditoria
    Invitado --> Aceptar
    Aceptar --> CrearCuenta
    Aceptar --> Asociar
    Invitar -.-> SMTP
    Recuperar -.-> SMTP
```

El rol persistido `owner` o `editor` todavía no cambia permisos: ambos se comportan
como miembros de la inmobiliaria. El administrador de plataforma puede operar sobre
cualquier inmobiliaria.
