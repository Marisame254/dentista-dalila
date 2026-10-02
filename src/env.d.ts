/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Dentista con sesión iniciada y acceso al panel; null en cualquier otro caso */
    user: import("@supabase/supabase-js").User | null;
    /** Cliente con la sesión actual; null si Supabase no está configurado */
    supabase: import("@supabase/supabase-js").SupabaseClient | null;
  }
}
