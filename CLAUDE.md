# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dental practice website for "Dra. Dalila" — a single-page Spanish-language site built with Astro, Tailwind CSS v4, and deployed on Vercel.

## Commands

- **Dev server:** `pnpm dev` (runs `astro dev`)
- **Build:** `pnpm build` (runs `astro build`)
- **Preview production build:** `pnpm preview`

No test framework is configured.

## Architecture

- **Framework:** Astro 5 (static site, no SSR) with Tailwind CSS v4 via `@tailwindcss/vite`
- **Package manager:** pnpm
- **Single page:** `src/pages/index.astro` is the only page — it composes all section components
- **Components:** All `.astro` files in `src/components/` (Header, Hero, Services, Consultorio, Appointments, Footer, WhatsAppButton, ThemeToggle)
- **Layout:** `src/layouts/Layout.astro` — base HTML shell with Calendly widget scripts and dark mode flash prevention
- **Styles:** `src/styles/global.css` — Tailwind import, dark mode variant (`@custom-variant dark`), custom animations (`fade-in`, `slide-in-right`, `float`), and scrollbar theming
- **Static assets:** `public/` — images (hero-bg.png, consul.png, radiografia.jpg, area_de_trabajo.jpg) and favicons

## Key Details

- **Language:** All user-facing content is in Spanish
- **Dark mode:** Class-based (`.dark` on `<html>`), persisted in `localStorage`. The `@custom-variant dark` in global.css enables Tailwind's dark variant
- **External integrations:** Calendly (appointment scheduling widget loaded via CDN), WhatsApp (floating button linking to a phone number), Vercel Speed Insights
- **Config values:** WhatsApp number and Calendly URL are defined as constants at the top of `src/pages/index.astro` and passed as props
- **Brand color:** Teal (`#0d9488` / Tailwind's `teal-600`)
