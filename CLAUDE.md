# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dental practice website for "Dra. Dalila" — a Spanish-language site built with Astro, Tailwind CSS v4 and Supabase, deployed on Vercel. It has a public landing page where patients request appointments and a private panel (`/panel`) where the dentist confirms them and reads patient messages.

## Commands

- **Dev server:** `pnpm dev` (runs `astro dev`)
- **Type check:** `pnpm astro check`
- **Build:** `pnpm build` (runs `astro build`)

No test framework is configured. `pnpm preview` is not supported by the Vercel adapter.

On Windows, `pnpm build` compiles everything but fails at the very last step (`EPERM ... symlink` while the Vercel adapter packages the function) unless Developer Mode is enabled. Vercel's own build (Linux) is not affected.

## Architecture

- **Framework:** Astro 5 with `@astrojs/vercel` (v9, the line compatible with Astro 5) and Tailwind CSS v4 via `@tailwindcss/vite`
- **Rendering:** public pages (`src/pages/index.astro`, `privacidad.astro`) are prerendered. Only `/panel/*` (`export const prerender = false`) and the Actions run on demand
- **Package manager:** pnpm
- **Config:** `src/config/site.ts` is the single source of business data (name, phone, address, opening hours, booking rules, services, FAQ, testimonials). Values marked `REEMPLAZAR` are placeholders
- **Public components:** `src/components/` (Header, Hero, Services, Consultorio, SobreMi, Testimonios, Appointments, FAQ, Ubicacion, Footer, WhatsAppButton, ThemeToggle)
- **Layouts:** `src/layouts/Layout.astro` (HTML shell, SEO, JSON-LD, dark mode flash prevention) and `PanelLayout.astro` (panel chrome, nav counters, flash messages)
- **Styles:** `src/styles/global.css` — font tokens (`font-display` Newsreader for headings, Albert Sans for text) and shared component classes (`wrap`, `section-title`, `btn*`, `field`, `label`, `card`)
- **Images:** `src/assets/`, rendered with `<Image>` from `astro:assets`

### Appointments and panel

- **Database:** Supabase Postgres. Schema and RLS in `supabase/migrations/0001_init.sql` (tables `appointments`, `messages`, `blocked_times`, `panel_users`)
- **No Supabase client in the browser.** `src/lib/supabase.ts` exposes a session client (cookies, respects RLS) and an admin client (service role, server only)
- **Public writes:** Astro Actions in `src/actions/index.ts` (`getAvailability`, `requestAppointment`, `sendMessage`), called from the script in `Appointments.astro`. They use the admin client, validate with zod, and never return patient data
- **Slots:** `src/lib/slots.ts` derives free slots from `site.openingHours` minus active appointments and blocked times. All `YYYY-MM-DD` / `HH:MM` values are in `site.timezone`. It is shared by server and browser
- **Double booking:** prevented by the partial unique index `appointments_active_slot`; Postgres error `23505` is mapped to a "slot taken" message
- **Auth:** `src/middleware.ts` guards `/panel/*`. A user must be logged in AND listed in `panel_users`; RLS policies check the same thing via `is_panel_user()`
- **Panel writes:** forms POST to their own page with a hidden `intent` field; `handlePanelPost` in `src/lib/panel.ts` runs it with the session client and redirects with `?aviso=<key>` (keys in `FLASH`)
- **Patient contact:** WhatsApp links with prefilled text (`whatsappLink` in `src/lib/format.ts`); there is no WhatsApp API integration

## Key Details

- **Language:** All user-facing content is in Spanish
- **Env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`). They are optional: without them the site builds, the booking form tells patients to use WhatsApp, and `/panel/login` shows a setup notice
- **Dark mode:** Class-based (`.dark` on `<html>`), persisted in `localStorage`. The `@custom-variant dark` in global.css enables Tailwind's dark variant
- **Content honesty:** testimonials, credentials and stats come from `site.ts` and must be real; sections hide themselves when the data is empty. The map only renders when `site.showMap` is true
- **External integrations:** Supabase, WhatsApp links, Vercel Speed Insights
- **Brand color:** Teal (`teal-700` for buttons and links, `teal-400` in dark mode)
