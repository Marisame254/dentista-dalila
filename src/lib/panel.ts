/**
 * Operaciones del panel de la dentista. Se ejecutan con el cliente de sesión,
 * así que RLS garantiza que solo un usuario de panel_users puede escribir.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AstroGlobal } from "astro";
import { z } from "astro/zod";
import { site } from "../config/site";
import { firstName, normalizePhone } from "./format";
import { zonedToUtc } from "./slots";

const UNIQUE_VIOLATION = "23505";

/** Avisos que se muestran tras una acción (?aviso=clave) */
export const FLASH: Record<string, { text: string; ok: boolean }> = {
  confirmed: { text: "Cita confirmada. Avísale al paciente por WhatsApp.", ok: true },
  cancelled: { text: "Cita cancelada. El horario quedó libre.", ok: true },
  completed: { text: "Cita marcada como completada.", ok: true },
  no_show: { text: "Cita marcada como no asistió.", ok: true },
  rescheduled: { text: "Cita reprogramada y confirmada. Avísale al paciente por WhatsApp.", ok: true },
  note_saved: { text: "Nota guardada.", ok: true },
  created: { text: "Cita creada.", ok: true },
  blocked: { text: "Horario bloqueado. Ya no se ofrece en la página.", ok: true },
  unblocked: { text: "Bloqueo eliminado.", ok: true },
  message_updated: { text: "Mensaje actualizado.", ok: true },
  conflict: { text: "Ya hay una cita activa en ese horario. Elige otro.", ok: false },
  invalid: { text: "Revisa los datos e intenta de nuevo.", ok: false },
  error: { text: "No se pudo guardar. Intenta de nuevo.", ok: false },
};

const id = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^\d{2}:\d{2}$/);
const phone = z
  .string()
  .transform(normalizePhone)
  .refine((digits) => digits.length >= 10 && digits.length <= 15);

const schemas = {
  "appointment-status": z.object({
    id,
    status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
  }),
  "appointment-reschedule": z.object({ id, date, time }),
  "appointment-note": z.object({ id, admin_note: z.string().trim().max(2000) }),
  "appointment-create": z.object({
    name: z.string().trim().min(2).max(80),
    phone,
    service: z.string().trim().min(2).max(80),
    date,
    time,
    duration: z.coerce.number().int().min(10).max(480),
    admin_note: z.string().trim().max(2000).optional(),
  }),
  "block-create": z.object({
    date_from: date,
    time_from: time,
    date_to: date,
    time_to: time,
    reason: z.string().trim().max(200).optional(),
  }),
  "block-delete": z.object({ id }),
  "message-read": z.object({ id, read: z.enum(["0", "1"]) }),
  "message-archive": z.object({ id, archived: z.enum(["0", "1"]) }),
};

type Intent = keyof typeof schemas;

function isIntent(value: unknown): value is Intent {
  return typeof value === "string" && value in schemas;
}

/** Ejecuta la acción de un formulario del panel y devuelve la clave del aviso */
async function runIntent(supabase: SupabaseClient, form: FormData): Promise<string> {
  const intent = form.get("intent");
  if (!isIntent(intent)) return "invalid";

  const parsed = schemas[intent].safeParse(Object.fromEntries(form));
  if (!parsed.success) return "invalid";

  const result = await execute(supabase, intent, parsed.data);
  if (result.error?.code === UNIQUE_VIOLATION) return "conflict";
  if (result.error) {
    console.error(`[panel] ${intent}`, result.error);
    return "error";
  }
  return result.flash;
}

async function execute(
  supabase: SupabaseClient,
  intent: Intent,
  data: unknown,
): Promise<{ flash: string; error: { code?: string } | null }> {
  switch (intent) {
    case "appointment-status": {
      const input = data as z.infer<(typeof schemas)["appointment-status"]>;
      const { error } = await supabase
        .from("appointments")
        .update({ status: input.status })
        .eq("id", input.id);
      return { flash: input.status, error };
    }
    case "appointment-reschedule": {
      const input = data as z.infer<(typeof schemas)["appointment-reschedule"]>;
      const { error } = await supabase
        .from("appointments")
        .update({
          starts_at: zonedToUtc(input.date, input.time).toISOString(),
          status: "confirmed",
        })
        .eq("id", input.id);
      return { flash: "rescheduled", error };
    }
    case "appointment-note": {
      const input = data as z.infer<(typeof schemas)["appointment-note"]>;
      const { error } = await supabase
        .from("appointments")
        .update({ admin_note: input.admin_note || null })
        .eq("id", input.id);
      return { flash: "note_saved", error };
    }
    case "appointment-create": {
      const input = data as z.infer<(typeof schemas)["appointment-create"]>;
      const { error } = await supabase.from("appointments").insert({
        patient_name: input.name,
        patient_phone: input.phone,
        service: input.service,
        starts_at: zonedToUtc(input.date, input.time).toISOString(),
        duration_min: input.duration,
        admin_note: input.admin_note || null,
        status: "confirmed",
        source: "panel",
      });
      return { flash: "created", error };
    }
    case "block-create": {
      const input = data as z.infer<(typeof schemas)["block-create"]>;
      const startsAt = zonedToUtc(input.date_from, input.time_from);
      const endsAt = zonedToUtc(input.date_to, input.time_to);
      if (endsAt <= startsAt) return { flash: "invalid", error: null };
      const { error } = await supabase.from("blocked_times").insert({
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        reason: input.reason || null,
      });
      return { flash: "blocked", error };
    }
    case "block-delete": {
      const input = data as z.infer<(typeof schemas)["block-delete"]>;
      const { error } = await supabase
        .from("blocked_times")
        .delete()
        .eq("id", input.id);
      return { flash: "unblocked", error };
    }
    case "message-read": {
      const input = data as z.infer<(typeof schemas)["message-read"]>;
      const { error } = await supabase
        .from("messages")
        .update({ read_at: input.read === "1" ? new Date().toISOString() : null })
        .eq("id", input.id);
      return { flash: "message_updated", error };
    }
    case "message-archive": {
      const input = data as z.infer<(typeof schemas)["message-archive"]>;
      const archived = input.archived === "1";
      const { error } = await supabase
        .from("messages")
        .update({
          archived,
          // Archivar un mensaje también lo da por leído.
          ...(archived ? { read_at: new Date().toISOString() } : {}),
        })
        .eq("id", input.id);
      return { flash: "message_updated", error };
    }
  }
}

/**
 * Para el frontmatter de las páginas del panel: si la petición es un POST,
 * ejecuta la acción y redirige a la misma página con el aviso (evita que
 * recargar la página repita la acción).
 */
export async function handlePanelPost(
  Astro: AstroGlobal,
): Promise<Response | null> {
  if (Astro.request.method !== "POST") return null;

  const supabase = Astro.locals.supabase;
  const flash = supabase
    ? await runIntent(supabase, await Astro.request.formData())
    : "error";

  const url = new URL(Astro.url);
  url.searchParams.set("aviso", flash);
  return Astro.redirect(url.pathname + url.search);
}

/** Texto de WhatsApp sugerido según el estado de la cita */
export function appointmentWhatsAppText(appointment: {
  patient_name: string;
  service: string;
  status: string;
  when: string;
}): string {
  const hello = `Hola ${firstName(appointment.patient_name)}, soy la ${site.name}.`;
  switch (appointment.status) {
    case "confirmed":
      return `${hello} Tu cita de ${appointment.service} quedó confirmada para el ${appointment.when}. ¡Te esperamos!`;
    case "cancelled":
      return `${hello} No me es posible atenderte el ${appointment.when}. ¿Te acomoda otro día u horario?`;
    case "pending":
      return `${hello} Recibí tu solicitud de cita de ${appointment.service} para el ${appointment.when}.`;
    default:
      return hello;
  }
}
