// Génère les fichiers de marque Saqia à partir de lib/brand/logo-svg.ts.
// Usage : node scripts/brand/build-assets.ts
//
// Sorties :
//   public/brand/   logos SVG (couleur, mono, inversé ; FR/AR), logo PNG 1024 px,
//                   avatars WhatsApp / réseaux 640 px (zone de sécurité ronde)
//   public/icons/   icônes PWA 192 / 512 et maskable 512
//   app/icon.svg, app/apple-icon.png (180), app/favicon.ico (16/32/48)
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { BRAND_COLORS, logoMarkup, logoSvgDocument, type LogoOptions } from "../../lib/brand/logo-svg.ts";

const BRAND_DIR = join("public", "brand");
const ICONS_DIR = join("public", "icons");

/** Symbole posé au centre d'un carré de fond, à `ratio` de la largeur. */
function framedSymbolSvg(size: number, ratio: number, background: string | null, options: LogoOptions): string {
  const { inner } = logoMarkup({ ...options, variant: "symbol" });
  const scale = (size * ratio) / 64;
  const offset = (size - size * ratio) / 2;
  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `${bg}<g transform="translate(${offset} ${offset}) scale(${scale})">${inner}</g></svg>`
  );
}

async function png(svg: string, file: string): Promise<Buffer> {
  const buffer = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(file, buffer);
  console.log(`✓ ${file}`);
  return buffer;
}

async function svgFile(svg: string, file: string): Promise<void> {
  await writeFile(file, `${svg}\n`);
  console.log(`✓ ${file}`);
}

/** Fichier .ico contenant des PNG (format accepté par tous les navigateurs actuels). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

await mkdir(BRAND_DIR, { recursive: true });
await mkdir(ICONS_DIR, { recursive: true });

// --- Logos vectoriels
const vectors: [string, LogoOptions, string][] = [
  ["logo-full.svg", { variant: "full" }, "Saqia"],
  ["logo-full-mono.svg", { variant: "full", tone: "mono" }, "Saqia"],
  ["logo-full-inverse.svg", { variant: "full", tone: "inverse" }, "Saqia"],
  ["logo-full-ar.svg", { variant: "full", lang: "ar" }, "ساقية"],
  ["logo-symbol.svg", { variant: "symbol" }, "Saqia"],
  ["logo-symbol-mono.svg", { variant: "symbol", tone: "mono" }, "Saqia"],
  ["logo-symbol-inverse.svg", { variant: "symbol", tone: "inverse" }, "Saqia"],
  ["logo-wordmark.svg", { variant: "wordmark" }, "Saqia"],
  ["logo-wordmark-ar.svg", { variant: "wordmark", lang: "ar" }, "ساقية"],
];
for (const [file, options, title] of vectors) {
  await svgFile(logoSvgDocument({ ...options, title }), join(BRAND_DIR, file));
}

// --- Logo PNG et avatars (le cercle de recadrage garde ~58 % du carré pour le symbole)
await png(logoSvgDocument({ variant: "full", pixelWidth: 1024 }), join(BRAND_DIR, "logo-full.png"));
await png(framedSymbolSvg(640, 0.58, BRAND_COLORS.soil50, { tone: "color" }), join(BRAND_DIR, "avatar-640.png"));
await png(framedSymbolSvg(640, 0.58, BRAND_COLORS.field900, { tone: "inverse" }), join(BRAND_DIR, "avatar-640-dark.png"));

// --- Icônes d'application
await png(framedSymbolSvg(192, 0.84, null, { tone: "color" }), join(ICONS_DIR, "icon-192.png"));
await png(framedSymbolSvg(512, 0.84, null, { tone: "color" }), join(ICONS_DIR, "icon-512.png"));
// Maskable : le contenu utile doit tenir dans le cercle central de 80 %.
await png(framedSymbolSvg(512, 0.56, BRAND_COLORS.soil50, { tone: "color" }), join(ICONS_DIR, "maskable-512.png"));
await png(framedSymbolSvg(180, 0.72, BRAND_COLORS.soil50, { tone: "color" }), join("app", "apple-icon.png"));

// --- Favicon : proportions renforcées pour 16–48 px
await svgFile(logoSvgDocument({ variant: "symbol", small: true, title: "Saqia" }), join("app", "icon.svg"));
const faviconImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    data: await sharp(Buffer.from(framedSymbolSvg(size, 1, null, { tone: "color", small: true })))
      .png()
      .toBuffer(),
  })),
);
await writeFile(join("app", "favicon.ico"), ico(faviconImages));
console.log("✓ app/favicon.ico");
