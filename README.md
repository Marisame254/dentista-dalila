# Sitio Web - Consultorio Dental Dra. Dalila

Sitio del consultorio dental de la Dra. Dalila, construido con Astro, Tailwind CSS y Supabase, desplegado en Vercel.

## Características

- Página pública con servicios, consultorio, preguntas frecuentes y ubicación
- Solicitud de citas en línea: el paciente elige día y hora, la doctora confirma
- Panel privado (`/panel`) con la agenda, las solicitudes pendientes y los mensajes de pacientes
- Avisos al paciente por WhatsApp con el texto ya escrito
- Modo claro y oscuro, SEO local con datos estructurados

## Puesta en marcha

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Datos del consultorio

Todo se edita en `src/config/site.ts`: nombre, teléfono, dirección, horarios, duración de las citas, servicios, preguntas frecuentes y testimonios. Los valores marcados con `REEMPLAZAR` son de ejemplo.

### 3. Base de datos (Supabase)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/migrations/0001_init.sql`.
3. En **Authentication > Users**, crea el usuario de la doctora (correo y contraseña).
4. En **SQL Editor**, dale acceso al panel (cambia el correo):

   ```sql
   insert into public.panel_users (user_id)
   select id from auth.users where email = 'correo-de-la-doctora@ejemplo.com';
   ```

5. En **Authentication > Sign In / Providers**, desactiva "Allow new users to sign up".
6. Copia `.env.example` como `.env` y llena las tres variables. Agrega las mismas en Vercel (**Settings > Environment Variables**).

Sin estas variables el sitio funciona, pero el formulario de citas pide agendar por WhatsApp y el panel no abre.

### 4. Servidor de desarrollo

```bash
pnpm dev
```

El sitio queda en `http://localhost:4321` y el panel en `http://localhost:4321/panel`.

## Comandos

| Comando | Acción |
|---------|--------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm astro check` | Revisión de tipos |
| `pnpm build` | Build de producción para Vercel |

En Windows, `pnpm build` falla en el último paso con `EPERM ... symlink` si no está activado el Modo de desarrollador. El build de Vercel no tiene ese problema.

## Cómo funcionan las citas

1. El paciente elige servicio, día y hora. Solo ve los horarios libres según `openingHours`, las citas activas y los bloqueos.
2. La solicitud llega al panel como **pendiente** y ese horario deja de ofrecerse.
3. La doctora la confirma, la reprograma o la rechaza, y avisa al paciente con el botón de WhatsApp.
4. Desde el panel también puede crear citas a mano y bloquear horarios (vacaciones, comida, días festivos).

## Estructura

```
/
├── public/                # Favicon, imagen para redes, robots.txt
├── supabase/migrations/   # Tablas y permisos de la base de datos
└── src/
    ├── actions/           # Acciones públicas: horarios, solicitar cita, mensaje
    ├── assets/            # Fotos (se optimizan al compilar)
    ├── components/        # Secciones de la página y tarjetas del panel
    ├── config/site.ts     # Datos del consultorio
    ├── layouts/           # Layout público y del panel
    ├── lib/               # Horarios, formato, Supabase, lógica del panel
    ├── middleware.ts      # Protege /panel
    ├── pages/             # index, privacidad y panel/*
    └── styles/global.css  # Tipografía y clases compartidas
```
