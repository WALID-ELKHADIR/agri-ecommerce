/**
 * Géométrie du logo Saqia (piste « Parcelle ») : une parcelle pleine,
 * traversée de bord à bord par un canal en S.
 *
 * Source unique du dessin : le composant React, les fichiers de
 * public/brand/, les icônes et l'image de partage en dépendent tous.
 * Module pur (sans React ni Next) : utilisable par les scripts Node.
 */
import { WORDMARK_ARABIC, WORDMARK_LATIN, type WordmarkOutline } from "./wordmarks.ts";

export type LogoTone = "color" | "mono" | "inverse";
export type LogoVariant = "full" | "symbol" | "wordmark";
export type LogoLang = "fr" | "ar";

export const BRAND_COLORS = {
  field600: "#3a6631",
  field900: "#1a2c18",
  water600: "#177c87",
  soil50: "#faf8f3",
  soil900: "#1f1c16",
  white: "#ffffff",
} as const;

const TONES: Record<LogoTone, { field: string; water: string; text: string }> = {
  color: { field: BRAND_COLORS.field600, water: BRAND_COLORS.water600, text: BRAND_COLORS.soil900 },
  mono: { field: BRAND_COLORS.soil900, water: BRAND_COLORS.soil900, text: BRAND_COLORS.soil900 },
  inverse: { field: BRAND_COLORS.white, water: BRAND_COLORS.white, text: BRAND_COLORS.white },
};

/** Symbole dessiné sur une grille de 64 × 64. */
export const SYMBOL_SIZE = 64;
/** Axe du canal : entre par la droite, deux virages, sort par la gauche. */
export const CHANNEL_PATH = "M64 18H29a7 7 0 0 0 0 14h6a7 7 0 0 1 0 14H0";

type SymbolGeometry = { radius: number; channel: number; cut: number };

/** Proportions standard, et version renforcée pour 16–32 px (favicon). */
const GEOMETRY: Record<"standard" | "small", SymbolGeometry> = {
  standard: { radius: 16, channel: 7, cut: 15 },
  small: { radius: 14, channel: 9, cut: 17 },
};

/** Lockup : le wordmark latin a une hauteur « ligne de base → point du i » de 46 unités. */
const LATIN_SCALE = 46 / WORDMARK_LATIN.baseline;
const ARABIC_SCALE = 48 / WORDMARK_ARABIC.baseline;
const LOCKUP_GAP = 14;
const LOCKUP_BASELINE = 55;

export type LogoMarkup = { viewBox: string; width: number; height: number; inner: string };

type Colors = { field: string; water: string; text: string };

type SymbolDrawing = {
  colors: Colors;
  maskId: string;
  size: "standard" | "small";
  x?: number;
  animatable: boolean;
};

function symbolInner({ colors, maskId, size, x = 0, animatable }: SymbolDrawing): string {
  const g = GEOMETRY[size];
  const t = x ? ` transform="translate(${x} 0)"` : "";
  const tile = `<rect width="64" height="64" rx="${g.radius}"/>`;
  // Attributs utiles seulement au tracé animé du composant React.
  const animation = animatable ? ` class="saqia-channel" pathLength="1"` : "";
  return (
    `<g${t}>` +
    `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
    `<rect width="64" height="64" fill="#fff"/>` +
    `<path d="${CHANNEL_PATH}" fill="none" stroke="#000" stroke-width="${g.cut}"/>` +
    `</mask>` +
    // Le canal est découpé selon la parcelle : rien ne dépasse des coins arrondis.
    `<clipPath id="${maskId}-clip">${tile}</clipPath>` +
    `<rect width="64" height="64" rx="${g.radius}" fill="${colors.field}" mask="url(#${maskId})"/>` +
    `<path${animation} d="${CHANNEL_PATH}" fill="none" stroke="${colors.water}" stroke-width="${g.channel}" clip-path="url(#${maskId}-clip)"/>` +
    `</g>`
  );
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wordmarkInner(outline: WordmarkOutline, scale: number, x: number, y: number, fill: string): string {
  return `<path transform="translate(${round(x)} ${round(y)}) scale(${round(scale, 5)})" d="${outline.d}" fill="${fill}"/>`;
}

function round(value: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export type LogoOptions = {
  variant?: LogoVariant;
  tone?: LogoTone;
  lang?: LogoLang;
  /** Identifiant unique du masque (plusieurs logos dans une même page). */
  maskId?: string;
  /** Proportions renforcées pour les très petites tailles. */
  small?: boolean;
  /** Ajoute les attributs du tracé animé (composant React uniquement). */
  animatable?: boolean;
  /** Ton « mono » en `currentColor` : le logo suit la couleur du texte (React). */
  currentColor?: boolean;
};

/** Contenu SVG (sans la balise <svg>) et dimensions du logo demandé. */
export function logoMarkup({
  variant = "full",
  tone = "color",
  lang = "fr",
  maskId = "saqia-parcelle",
  small = false,
  animatable = false,
  currentColor = false,
}: LogoOptions = {}): LogoMarkup {
  const c: Colors =
    tone === "mono" && currentColor
      ? { field: "currentColor", water: "currentColor", text: "currentColor" }
      : TONES[tone];
  const size = small ? "small" : "standard";
  const drawing = { colors: c, maskId, size, animatable } as const;
  const outline = lang === "ar" ? WORDMARK_ARABIC : WORDMARK_LATIN;
  const scale = lang === "ar" ? ARABIC_SCALE : LATIN_SCALE;
  const wordWidth = outline.width * scale;
  const wordHeight = outline.height * scale;
  const wordTop = LOCKUP_BASELINE - outline.baseline * scale;

  if (variant === "symbol") {
    return { viewBox: "0 0 64 64", width: 64, height: 64, inner: symbolInner(drawing) };
  }

  if (variant === "wordmark") {
    const w = round(wordWidth);
    const h = round(wordHeight);
    return { viewBox: `0 0 ${w} ${h}`, width: w, height: h, inner: wordmarkInner(outline, scale, 0, 0, c.text) };
  }

  const height = round(Math.max(SYMBOL_SIZE, wordTop + wordHeight));
  const width = round(SYMBOL_SIZE + LOCKUP_GAP + wordWidth);
  // Lecture de droite à gauche en arabe : le symbole passe à droite.
  const inner =
    lang === "ar"
      ? wordmarkInner(outline, scale, 0, wordTop, c.text) + symbolInner({ ...drawing, x: width - SYMBOL_SIZE })
      : symbolInner(drawing) + wordmarkInner(outline, scale, SYMBOL_SIZE + LOCKUP_GAP, wordTop, c.text);

  return { viewBox: `0 0 ${width} ${height}`, width, height, inner };
}

/** Document SVG autonome (fichiers statiques, image de partage). */
export function logoSvgDocument(options: LogoOptions & { title?: string; pixelWidth?: number } = {}): string {
  const { viewBox, width, height, inner } = logoMarkup(options);
  const pixelWidth = options.pixelWidth ?? width;
  const pixelHeight = round((pixelWidth * height) / width);
  const title = options.title ? `<title>${escapeXml(options.title)}</title>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${pixelWidth}" height="${pixelHeight}" role="img">` +
    `${title}${inner}</svg>`
  );
}
