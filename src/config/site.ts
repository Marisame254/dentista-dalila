/**
 * Fuente única de datos del consultorio (NAP: Name, Address, Phone).
 *
 * Estos valores alimentan a la vez:
 *  - Los datos estructurados JSON-LD (Schema.org "Dentist") en Layout.astro
 *  - Los meta tags Open Graph / Twitter
 *  - La información de contacto del Footer y la sección de ubicación
 *  - Los horarios que se ofrecen al agendar una cita
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

export interface Testimonial {
  /** Nombre del paciente tal como autorizó que se publique */
  name: string;
  text: string;
}

export interface Faq {
  question: string;
  answer: string;
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

  /**
   * Muestra el mapa de Google en la sección de ubicación.
   * Poner en true SOLO cuando la dirección y las coordenadas de arriba sean las reales,
   * para no mandar pacientes a un lugar equivocado.
   */
  showMap: false as boolean,

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

  /** Zona horaria del consultorio (los horarios de arriba están en esta zona) */
  timezone: "America/Mexico_City",

  /** Reglas para agendar citas desde la página */
  booking: {
    /** Duración de cada cita en minutos */
    slotMinutes: 60, // REEMPLAZAR: duración típica de una cita
    /** Cuántos días hacia adelante se puede agendar */
    daysAhead: 30,
    /** Horas mínimas de anticipación para solicitar una cita */
    minNoticeHours: 12,
  },

  /** Redes sociales (URLs reales). Dejar "" para ocultar el ícono. */
  social: {
    facebook: "", // REEMPLAZAR: URL de Facebook
    instagram: "", // REEMPLAZAR: URL de Instagram
  },

  /** Rango de precios para Schema.org, ej. "$", "$$", "$$$" */
  priceRange: "$$",

  /** Imagen para compartir en redes (Open Graph / Twitter), 1200x630 */
  ogImage: "/og-image.png",

  /** Servicios ofrecidos (alimenta availableService del JSON-LD y el formulario de citas) */
  services: [
    "Odontología Preventiva",
    "Estética Dental",
    "Ortodoncia",
    "Implantes Dentales",
    "Endodoncia",
    "Odontopediatría",
  ],

  /** Cifras del Hero. REEMPLAZAR con datos reales o dejar [] para ocultarlas. */
  stats: [
    { value: "10+", label: "años de experiencia" },
    { value: "500+", label: "pacientes atendidos" },
  ] as { value: string; label: string }[],

  /** Sección "Sobre la doctora" */
  about: {
    /** REEMPLAZAR: uno o dos párrafos con la trayectoria real de la doctora */
    paragraphs: [
      "Soy cirujana dentista y atiendo personalmente a cada paciente en mi consultorio de Oaxaca de Juárez.",
      "Antes de cualquier tratamiento reviso tu caso contigo, te muestro tus radiografías y te explico las opciones, para que decidas con calma y sin sorpresas.",
    ],
    /** REEMPLAZAR: universidad, especialidades, diplomados. Dejar [] para ocultar. */
    credentials: [] as string[],
    /** REEMPLAZAR: número de cédula profesional. Dejar "" para ocultar. */
    cedula: "",
  },

  /**
   * Testimonios REALES de pacientes (con su autorización).
   * Mientras esté vacío, la sección no se muestra.
   */
  testimonials: [] as Testimonial[],

  /** Preguntas frecuentes (también se publican como datos estructurados FAQPage) */
  faq: [
    {
      question: "¿Cómo agendo una cita?",
      answer:
        "Elige el servicio, el día y la hora en la sección de citas y deja tu nombre y teléfono. Recibirás la confirmación por WhatsApp. Si lo prefieres, también puedes escribirnos directamente por WhatsApp.",
    },
    {
      question: "¿Mi cita queda confirmada al enviar la solicitud?",
      answer:
        "Todavía no. La doctora revisa cada solicitud y te confirma por WhatsApp. Si el horario que elegiste no está disponible, te propone otro.",
    },
    {
      question: "¿Qué hago si necesito cancelar o cambiar mi cita?",
      answer:
        "Escríbenos por WhatsApp con la mayor anticipación posible para reprogramarla y liberar el horario para otro paciente.",
    },
    {
      question: "¿Atienden a niños?",
      answer:
        "Sí. Ofrecemos odontopediatría, con atención pensada para que los más pequeños se sientan tranquilos en su consulta.",
    },
  ] as Faq[],
} as const;

export type Site = typeof site;
