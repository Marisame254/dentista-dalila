/**
 * Acciones públicas: las llama el formulario de citas desde el navegador.
 * Nunca devuelven datos de pacientes, solo horarios libres y confirmaciones.
 */
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { site } from "../config/site";
import { normalizePhone } from "../lib/format";
import { dayRange, freeSlots, zonedToUtc, type Busy } from "../lib/slots";
import { createAdminClient, isSupabaseConfigured } from "../lib/supabase";

const MAX_PENDING_PER_PHONE = 2;
const MAX_UNREAD_PER_PHONE = 3;
const UNIQUE_VIOLATION = "23505";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((digits) => digits.length >= 10 && digits.length <= 15, {
    message: "Escribe tu teléfono con lada, 10 dígitos.",
  });
const nameSchema = z
  .string()
  .trim()
  .min(2, "Escribe tu nombre.")
  .max(80, "El nombre es demasiado largo.");
/** Campo trampa: las personas no lo ven, los bots lo llenan */
const honeypotSchema = z.string().max(200).optional();
const consentSchema = z.literal(true, {
  errorMap: () => ({ message: "Acepta el aviso de privacidad para continuar." }),
});

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new ActionError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "La agenda en línea no está disponible por ahora. Escríbenos por WhatsApp para agendar.",
    });
  }
  return createAdminClient();
}

function fail(context: string, error: unknown): never {
  console.error(`[actions] ${context}`, error);
  throw new ActionError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      "No pudimos completar la operación. Intenta de nuevo o escríbenos por WhatsApp.",
  });
}

/** Citas activas y bloqueos que tocan un día del consultorio */
async function busyIntervals(
  supabase: ReturnType<typeof createAdminClient>,
  date: string,
): Promise<Busy[]> {
  const { start, end } = dayRange(date);
  // Margen de un día hacia atrás por si una cita o bloqueo empezó antes y sigue activo.
  const from = new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [appointments, blocks] = await Promise.all([
    supabase
      .from("appointments")
      .select("starts_at, duration_min")
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", from)
      .lt("starts_at", end.toISOString()),
    supabase
      .from("blocked_times")
      .select("starts_at, ends_at")
      .lt("starts_at", end.toISOString())
      .gt("ends_at", start.toISOString()),
  ]);

  if (appointments.error) fail("busyIntervals appointments", appointments.error);
  if (blocks.error) fail("busyIntervals blocked_times", blocks.error);

  return [
    ...appointments.data.map((a) => {
      const startMs = new Date(a.starts_at).getTime();
      return { start: startMs, end: startMs + a.duration_min * 60 * 1000 };
    }),
    ...blocks.data.map((b) => ({
      start: new Date(b.starts_at).getTime(),
      end: new Date(b.ends_at).getTime(),
    })),
  ];
}

export const server = {
  getAvailability: defineAction({
    input: z.object({ date: dateSchema }),
    handler: async ({ date }) => {
      const supabase = requireSupabase();
      const busy = await busyIntervals(supabase, date);
      return { date, slots: freeSlots(date, busy) };
    },
  }),

  requestAppointment: defineAction({
    input: z.object({
      service: z.enum(site.services),
      date: dateSchema,
      time: z.string().regex(/^\d{2}:\d{2}$/),
      name: nameSchema,
      phone: phoneSchema,
      note: z.string().trim().max(500).optional(),
      consent: consentSchema,
      website: honeypotSchema,
    }),
    handler: async (input) => {
      // Bot: respondemos como si todo hubiera salido bien y no guardamos nada.
      if (input.website) return { ok: true };

      const supabase = requireSupabase();

      const busy = await busyIntervals(supabase, input.date);
      if (!freeSlots(input.date, busy).includes(input.time)) {
        throw new ActionError({
          code: "CONFLICT",
          message: "Ese horario ya no está disponible. Elige otro, por favor.",
        });
      }

      const pending = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("patient_phone", input.phone)
        .eq("status", "pending");
      if (pending.error) fail("requestAppointment pending count", pending.error);
      if ((pending.count ?? 0) >= MAX_PENDING_PER_PHONE) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Ya tienes solicitudes pendientes de confirmar. Te escribiremos por WhatsApp muy pronto.",
        });
      }

      const { error } = await supabase.from("appointments").insert({
        patient_name: input.name,
        patient_phone: input.phone,
        service: input.service,
        starts_at: zonedToUtc(input.date, input.time).toISOString(),
        duration_min: site.booking.slotMinutes,
        patient_note: input.note || null,
        source: "web",
      });

      if (error?.code === UNIQUE_VIOLATION) {
        throw new ActionError({
          code: "CONFLICT",
          message: "Ese horario se acaba de ocupar. Elige otro, por favor.",
        });
      }
      if (error) fail("requestAppointment insert", error);

      return { ok: true };
    },
  }),

  sendMessage: defineAction({
    input: z.object({
      name: nameSchema,
      phone: phoneSchema,
      body: z
        .string()
        .trim()
        .min(5, "Escribe tu mensaje.")
        .max(1000, "El mensaje es demasiado largo."),
      consent: consentSchema,
      website: honeypotSchema,
    }),
    handler: async (input) => {
      if (input.website) return { ok: true };

      const supabase = requireSupabase();

      const unread = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("phone", input.phone)
        .is("read_at", null);
      if (unread.error) fail("sendMessage unread count", unread.error);
      if ((unread.count ?? 0) >= MAX_UNREAD_PER_PHONE) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Ya recibimos tus mensajes. Te responderemos por WhatsApp muy pronto.",
        });
      }

      const { error } = await supabase.from("messages").insert({
        name: input.name,
        phone: input.phone,
        body: input.body,
      });
      if (error) fail("sendMessage insert", error);

      return { ok: true };
    },
  }),
};
