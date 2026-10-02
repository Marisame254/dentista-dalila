/**
 * Cálculo de horarios para citas. Sin dependencias de servidor: se usa tanto en
 * las Actions como en el formulario del navegador.
 *
 * Las fechas "YYYY-MM-DD" y horas "HH:MM" siempre están en la zona horaria del
 * consultorio (site.timezone), sin importar dónde esté el servidor o el paciente.
 */
import { site } from "../config/site";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** Intervalo ocupado en milisegundos UTC */
export interface Busy {
  start: number;
  end: number;
}

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: site.timezone,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zonedParts(date: Date): Record<string, string> {
  return Object.fromEntries(
    partsFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
}

function tzOffsetMs(date: Date): number {
  const p = zonedParts(date);
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Fecha y hora del consultorio → instante UTC */
export function zonedToUtc(date: string, time: string): Date {
  const guess = new Date(`${date}T${time}:00Z`);
  return new Date(guess.getTime() - tzOffsetMs(guess));
}

/** Instante UTC → fecha y hora del consultorio */
export function utcToZoned(date: Date): { date: string; time: string } {
  const p = zonedParts(date);
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
  };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** Todos los horarios de un día según site.openingHours, sin considerar citas */
export function daySlots(date: string): string[] {
  const weekday = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  const step = site.booking.slotMinutes;
  const slots: string[] = [];

  for (const hours of site.openingHours) {
    if (!hours.days.includes(weekday)) continue;
    const closes = toMinutes(hours.closes);
    for (let t = toMinutes(hours.opens); t + step <= closes; t += step) {
      slots.push(toTime(t));
    }
  }
  return slots.sort();
}

/** Primer instante en que se acepta una solicitud (anticipación mínima) */
function earliestStart(now: Date): number {
  return now.getTime() + site.booking.minNoticeHours * HOUR_MS;
}

/** Última fecha que se puede agendar */
function lastBookableDate(now: Date): string {
  return addDays(utcToZoned(now).date, site.booking.daysAhead);
}

/** Horarios de un día que siguen libres */
export function freeSlots(
  date: string,
  busy: Busy[],
  now: Date = new Date(),
): string[] {
  if (date > lastBookableDate(now)) return [];
  const earliest = earliestStart(now);
  const duration = site.booking.slotMinutes * MINUTE_MS;

  return daySlots(date).filter((time) => {
    const start = zonedToUtc(date, time).getTime();
    if (start < earliest) return false;
    const end = start + duration;
    return !busy.some((b) => start < b.end && end > b.start);
  });
}

/** Días que se ofrecen en el formulario (con al menos un horario por horario de atención) */
export function bookableDates(now: Date = new Date()): string[] {
  const today = utcToZoned(now).date;
  const dates: string[] = [];
  for (let i = 0; i <= site.booking.daysAhead; i++) {
    const date = addDays(today, i);
    if (freeSlots(date, [], now).length > 0) dates.push(date);
  }
  return dates;
}

/** Límites UTC de un día del consultorio, para consultar la base de datos */
export function dayRange(date: string): { start: Date; end: Date } {
  return {
    start: zonedToUtc(date, "00:00"),
    end: zonedToUtc(addDays(date, 1), "00:00"),
  };
}
