# Guía de usuario

## Visitante

1. Abra `/` para ver propiedades destacadas y municipios populares.
2. Entre a `/propiedades` para buscar, filtrar y ordenar el catálogo.
3. Abra una propiedad para revisar características, galería, datos legales declarados
   y otras opciones relacionadas.
4. Use WhatsApp, correo o teléfono para contactar directamente a la inmobiliaria.
5. Abra el perfil de la inmobiliaria para consultar su información e inventario.

La plataforma muestra contenido publicado; no garantiza propiedad, tradición, uso del
suelo ni validez jurídica.

## Miembro de inmobiliaria

### Iniciar sesión

1. Abra `/iniciar-sesion`.
2. Ingrese el correo y la contraseña de una cuenta invitada.
3. El sistema abre `/panel`; si la sesión falta, el panel vuelve al inicio de sesión.

### Actualizar el perfil

1. Abra **Perfil**.
2. Si administra varias inmobiliarias, seleccione la correcta.
3. Modifique únicamente los campos permitidos y guarde.
4. El sistema vuelve a validar la pertenencia y registra la operación.

### Crear una propiedad

1. Abra **Propiedades** y seleccione la inmobiliaria.
2. Pulse **Crear propiedad**.
3. Complete los datos y cargue de una a cinco imágenes JPEG, PNG o WebP; cada archivo
   debe pesar como máximo 10 MB.
4. Guarde el borrador. Las imágenes se convierten a WebP y se almacenan con la
   propiedad en una transacción.

### Enviar a publicación

- Agencia `pending`: la propiedad entra a `pending_review`.
- Agencia `verified`: la propiedad pasa directamente a `published`.
- Agencia `suspended`: el envío se bloquea.

Editar una propiedad publicada o pendiente la devuelve a borrador. Consulte la
[limitación conocida de propiedades rechazadas](./limitaciones-conocidas.md).

### Archivar

Desde la lista de propiedades puede archivar un elemento. El elemento deja de ser
público y la operación queda auditada.

## Administrador de plataforma

### Confianza y moderación

1. Abra **Moderación**.
2. Cambie una inmobiliaria entre `pending`, `verified` y `suspended`.
3. Apruebe o rechace propiedades en revisión; el rechazo exige una explicación.
4. Consulte los eventos recientes para reconstruir quién hizo cada cambio.

### Invitaciones y correo

1. Abra **Accesos y correo**.
2. Elija inmobiliaria, correo y rol `owner` o `editor`.
3. Cree la invitación. Una invitación pendiente puede revocarse.
4. Revise la bandeja de salida. En desarrollo puede abrir la vista previa; en modo
   SMTP puede reintentar mensajes fallidos hasta el límite configurado.

## Persona invitada

- Cuenta nueva: abra el enlace, indique nombre y contraseña y cree la cuenta.
- Cuenta existente: inicie sesión con el mismo correo y vuelva al enlace.
- Un enlace vencido, revocado o consumido no puede reutilizarse.
- La invitación vence a los siete días.

## Recuperar contraseña

1. Abra `/recuperar-contrasena` desde el inicio de sesión.
2. Ingrese el correo. La respuesta es siempre genérica para no revelar cuentas.
3. Si la cuenta existe, use el enlace recibido durante la hora siguiente.
4. Defina una contraseña nueva. Las sesiones anteriores se revocan.

## Problemas frecuentes

| Situación | Acción |
| --- | --- |
| No aparece una propiedad pública | Confirme que su estado sea `published`. |
| No se puede enviar a publicación | Revise estado de agencia, imágenes y estado de propiedad. |
| La invitación no funciona | Compruebe correo de sesión, vigencia y que no esté consumida. |
| No llega un correo | Un administrador debe revisar la outbox y la configuración SMTP. |
| El panel muestra otra inmobiliaria | Detenga la operación y reporte el caso; no intente modificar datos. |
