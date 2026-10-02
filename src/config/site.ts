/**
 * Fuente única de datos del consultorio (NAP: Name, Address, Phone).
 *
 * Estos valores alimentan a la vez:
 *  - Los datos estructurados JSON-LD (Schema.org "Dentist") en Layout.astro
 *  - Los meta tags Open Graph / Twitter
 *  - La información de contacto del Footer
 *
 * IMPORTANTE: Para un buen SEO local, el NAP de aquí debe coincidir
 * EXACTAMENTE con el de la ficha de Google Business.
 *
 * TODO: Reemplazar los valores marcados con «REEMPLAZAR» por los datos reales.
 */

export interface OpeningHour {
  /** Días en formato Schema.org: Monday, Tuesday, ... Sunday */
  days: string[];
  /** Hora de apertura en formato 24h, ej. "09:00" */
  opens: string;
  /** Hora de cierre en formato 24h, ej. "18:00" */
  closes: string;
}

export const site = {
  /** Nombre comercial corto (marca) */
  name: "Dra. Dalila",
  /** Nombre completo / legal de la doctora */
  legalName: "Dra. Dalila Sarai", // REEMPLAZAR: nombre completo
  /** Descripción usada como fallback en meta description */
  description:
    "Consultorio dental de la Dra. Dalila. Odontología general, estética dental, ortodoncia, implantes y más, con atención personalizada.",

  /** URL canónica del sitio (sin barra final). Debe coincidir con `site` en astro.config.mjs */
  url: "https://dentista-dalila.vercel.app",

  /** Teléfono visible en formato internacional, ej. "+52 951 218 3883" */
  phone: "+52 951 218 3883", // REEMPLAZAR si el visible es distinto al de WhatsApp
  /** WhatsApp: código de país + número, sin signos (para wa.me) */
  whatsapp: "529512183883",
  /** Email de contacto (opcional, dejar "" si no aplica) */
  email: "",

  address: {
    street: "Calle y número, Colonia", // REEMPLAZAR
    locality: "Oaxaca de Juárez", // REEMPLAZAR: ciudad
    region: "Oaxaca", // REEMPLAZAR: estado
    postalCode: "68000", // REEMPLAZAR: código postal
    country: "MX",
  },

  /** Coordenadas de Google Maps (clic derecho > copiar lat,long). Dejar null si no se tienen. */
  geo: {
    lat: 17.0732, // REEMPLAZAR
    lng: -96.7266, // REEMPLAZAR
  } as { lat: number; lng: number } | null,

  /** Horarios de atención */
  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    // REEMPLAZAR / ajustar. Ej. sábado:
    // { days: ["Saturday"], opens: "09:00", closes: "13:00" },
  ] as OpeningHour[],

  /** Texto legible de horarios para mostrar en el Footer */
  openingHoursLabel: "Lun - Vie: 9:00 AM - 6:00 PM", // REEMPLAZAR si cambia

  /** Redes sociales (URLs reales). Dejar "" para ocultar el ícono. */
  social: {
    facebook: "", // REEMPLAZAR: URL de Facebook
    instagram: "", // REEMPLAZAR: URL de Instagram
  },

  /** Rango de precios para Schema.org, ej. "$", "$$", "$$$" */
  priceRange: "$$",

  /** Integraciones */
  calendlyUrl: "https://calendly.com/dalilasarai78902/nueva-reunion",

  /** Imagen para compartir en redes (Open Graph / Twitter), 1200x630 */
  ogImage: "/og-image.png",

  /** Servicios ofrecidos (alimenta availableService del JSON-LD) */
  services: [
    "Odontología Preventiva",
    "Estética Dental",
    "Ortodoncia",
    "Implantes Dentales",
    "Endodoncia",
    "Odontopediatría",
  ],
} as const;

export type Site = typeof site;
