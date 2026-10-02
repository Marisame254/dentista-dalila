/**
 * Clientes de Supabase. SOLO para código de servidor (Actions, middleware y
 * páginas de /panel): ninguna llave llega al navegador.
 */
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "astro:env/server";

/** false mientras no se configuren las variables de entorno (ver .env.example) */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Cliente con la sesión de la dentista (cookies). Respeta RLS: solo ve datos
 * si el usuario está en la tabla panel_users.
 */
export function createSessionClient(
  request: Request,
  cookies: AstroCookies,
): SupabaseClient {
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" }),
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies.set(name, value, { ...options, path: "/" }),
        );
      },
    },
  });
}

/**
 * Cliente con la service role key: se salta RLS. Úsalo solo en las Actions
 * públicas, que validan todo lo que escriben y nunca devuelven datos de pacientes.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
