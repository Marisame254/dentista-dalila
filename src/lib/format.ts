import { site } from "../config/site";
import { utcToZoned } from "./slots";

const longDate = new Intl.DateTimeFormat("es-MX", {
  timeZone: site.timezone,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const shortDate = new Intl.DateTimeFormat("es-MX", {
  timeZone: site.timezone,
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** "martes, 6 de octubre" */
export function formatDate(value: string | Date): string {
  return longDate.format(new Date(value));
}

/** Hora del consultorio "HH:MM" → "9:00 AM" */
export function formatClock(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** "10:00 AM" */
export function formatTime(value: string | Date): string {
  return formatClock(utcToZoned(new Date(value)).time);
}

/** "mar, 6 oct, 10:00 AM" */
export function formatDateTime(value: string | Date): string {
  return `${shortDate.format(new Date(value))}, ${formatTime(value)}`;
}

/** Deja solo dígitos: "+52 951 218 3883" → "529512183883" */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Número para wa.me: a los de 10 dígitos se les antepone la lada de México */
export function whatsappNumber(phone: string): string {
  const digits = normalizePhone(phone);
  return digits.length === 10 ? `52${digits}` : digits;
}

export function whatsappLink(phone: string, text?: string): string {
  const base = `https://wa.me/${whatsappNumber(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Primer nombre, para saludar en los mensajes */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
