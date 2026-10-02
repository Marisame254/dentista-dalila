import { defineMiddleware } from "astro:middleware";
import { createSessionClient, isSupabaseConfigured } from "./lib/supabase";

const LOGIN_PATH = "/panel/login";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;
  context.locals.supabase = null;

  // La página pública está prerenderizada: solo el panel necesita sesión.
  const path = context.url.pathname;
  if (context.isPrerendered || !path.startsWith("/panel")) return next();

  const isLogin = path === LOGIN_PATH || path === `${LOGIN_PATH}/`;

  if (!isSupabaseConfigured) {
    return isLogin ? next() : context.redirect(LOGIN_PATH);
  }

  const supabase = createSessionClient(context.request, context.cookies);
  context.locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Tener cuenta no basta: debe estar dada de alta en panel_users.
    const { data: panelUser } = await supabase
      .from("panel_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (panelUser) context.locals.user = user;
  }

  if (!context.locals.user && !isLogin) return context.redirect(LOGIN_PATH);
  if (context.locals.user && isLogin) return context.redirect("/panel");

  return next();
});
