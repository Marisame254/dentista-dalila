# Sitio Web - Consultorio Dental Dra. Dalila

Página web estática profesional para el consultorio dental de la Dra. Dalila, construida con Astro y Tailwind CSS.

## Características

- Landing page moderna y atractiva
- Sección de servicios dentales
- Integración con Calendly para agendar citas
- Botón flotante de WhatsApp para contacto directo
- Diseño responsive y optimizado para móviles
- SEO optimizado
- Rendimiento excepcional

## Configuración Inicial

### 1. Configurar WhatsApp y Calendly

Edita el archivo `src/pages/index.astro` y actualiza las siguientes constantes con tu información:

```javascript
const WHATSAPP_NUMBER = "521234567890"; // Tu número con código de país
const CALENDLY_URL = "https://calendly.com/tu-usuario"; // Tu URL de Calendly
```

**Para WhatsApp:**
- Formato: Código de país + número (sin espacios, guiones ni paréntesis)
- Ejemplo México: `521234567890`
- Ejemplo USA: `11234567890`

**Para Calendly:**
- Inicia sesión en tu cuenta de Calendly
- Ve a "Event Types" y copia el enlace de tu evento
- Ejemplo: `https://calendly.com/dra-dalila/consulta`

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

El sitio estará disponible en `http://localhost:4321`

## Comandos Disponibles

| Comando | Acción |
|---------|--------|
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Construye el sitio para producción en `./dist/` |
| `pnpm preview` | Vista previa del build de producción |

## Personalización

### Cambiar Colores

Los colores principales están definidos usando Tailwind CSS. Para cambiar el esquema de colores:

- **Color principal (teal)**: Reemplaza `teal-*` con otro color de Tailwind (ej: `blue-*`, `purple-*`)
- Los colores se usan en:
  - `src/components/Header.astro`
  - `src/components/Hero.astro`
  - `src/components/Services.astro`
  - `src/components/Appointments.astro`

### Modificar Servicios

Edita el array `services` en `src/components/Services.astro`:

```javascript
const services = [
  {
    icon: `<path...>`,
    title: "Tu Servicio",
    description: "Descripción del servicio"
  },
  // ... más servicios
];
```

### Cambiar Textos

- **Nombre del consultorio**: Busca "Dra. Dalila" en los archivos y reemplázalo
- **Textos de la landing**: Edita `src/components/Hero.astro`
- **Footer**: Edita `src/components/Footer.astro`

## Despliegue

### Netlify (Recomendado)

1. Conecta tu repositorio en [Netlify](https://netlify.com)
2. Configura el build:
   - Build command: `pnpm build`
   - Publish directory: `dist`
3. Despliega

### Vercel

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Vercel detectará automáticamente Astro
3. Despliega

### GitHub Pages

```bash
pnpm build
# Sube la carpeta dist/ a tu repositorio
```

## Estructura del Proyecto

```
/
├── public/          # Archivos estáticos (imágenes, favicon, etc.)
├── src/
│   ├── components/  # Componentes reutilizables
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── Services.astro
│   │   ├── Appointments.astro
│   │   └── WhatsAppButton.astro
│   ├── layouts/     # Layouts de página
│   │   └── Layout.astro
│   ├── pages/       # Páginas del sitio
│   │   └── index.astro
│   └── styles/      # Estilos globales
│       └── global.css
└── package.json
```

## Optimizaciones Aplicadas

- HTML estático generado en build time
- Lazy loading de scripts
- Optimización de imágenes automática
- CSS minificado
- Componentes modulares y reutilizables
- Accesibilidad web (WCAG)
- SEO optimizado con meta tags

## Soporte

Para más información sobre Astro: [https://docs.astro.build](https://docs.astro.build)

## Próximos Pasos Recomendados

1. Agregar imágenes reales del consultorio en `public/images/`
2. Personalizar el favicon en `public/`
3. Agregar testimonios de pacientes
4. Incluir galería de antes/después
5. Agregar sección de preguntas frecuentes (FAQ)
6. Configurar Google Analytics
7. Agregar schema markup para SEO local
