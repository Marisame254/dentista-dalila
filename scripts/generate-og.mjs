/**
 * Genera la imagen social (Open Graph / Twitter) en public/og-image.png.
 *
 * Diseña un SVG de marca (1200x630) y lo rasteriza a PNG con sharp.
 * Ejecutar: `node scripts/generate-og.mjs`
 *
 * Los textos se toman de src/config/site.ts para mantener una sola fuente.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// --- Resolver sharp (puede no estar hoisteado por pnpm) -------------------
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  const pnpmDir = join(root, "node_modules", ".pnpm");
  const sharpPkg = readdirSync(pnpmDir).find((d) => d.startsWith("sharp@"));
  if (!sharpPkg) {
    throw new Error("No se encontró 'sharp'. Ejecuta `pnpm install` primero.");
  }
  const sharpPath = join(pnpmDir, sharpPkg, "node_modules", "sharp");
  sharp = (await import(`file://${sharpPath}/lib/index.js`)).default;
}

// --- Datos de marca -------------------------------------------------------
const NAME = "Dra. Dalila";
const TAGLINE = "Consultorio Dental";
const CITY = "Oaxaca de Juárez"; // coincide con site.address.locality
const TEAL = "#0d9488";
const TEAL_DARK = "#0f766e";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TEAL}"/>
      <stop offset="1" stop-color="${TEAL_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- patrón decorativo sutil -->
  <circle cx="1050" cy="120" r="260" fill="#ffffff" opacity="0.06"/>
  <circle cx="150" cy="540" r="200" fill="#ffffff" opacity="0.05"/>

  <!-- ícono de diente -->
  <g transform="translate(110, 235) scale(7)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </g>

  <!-- textos -->
  <text x="330" y="285" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="700" fill="#ffffff">${NAME}</text>
  <text x="332" y="350" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="400" fill="#d1fae5">${TAGLINE}</text>
  <text x="332" y="408" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="400" fill="#99f6e4">${CITY}</text>
</svg>`;

const outPath = join(root, "public", "og-image.png");

await sharp(Buffer.from(svg)).png().toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`✓ Generada ${outPath} (${meta.width}x${meta.height})`);
