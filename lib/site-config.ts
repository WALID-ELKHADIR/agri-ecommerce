/**
 * Coordonnées et réglages publics du site, lus depuis les variables
 * d'environnement `NEXT_PUBLIC_*` avec des valeurs de repli.
 *
 * Module sans dépendance Next : il est importé tel quel par les tests Node.
 */

export type SiteEnvKey =
  | "NEXT_PUBLIC_WHATSAPP_NUMBER"
  | "NEXT_PUBLIC_PHONE"
  | "NEXT_PUBLIC_CONTACT_EMAIL"
  | "NEXT_PUBLIC_ADDRESS"
  | "NEXT_PUBLIC_HOURS"
  | "NEXT_PUBLIC_SITE_URL";

export type SiteEnv = Partial<Record<SiteEnvKey, string | undefined>>;

export type SiteConfig = {
  name: string;
  /** Slogan de marque. */
  slogan: string;
  /** Sous-titre descriptif (métadonnées, pied de page). */
  tagline: string;
  /** Format international, chiffres uniquement (ex. 212612345678). */
  whatsappNumber: string;
  phoneDisplay: string;
  /** Pour les liens `tel:` (ex. +212612345678). */
  phoneRaw: string;
  email: string;
  address: string;
  hours: string;
  /** URL absolue, sans slash final. */
  siteUrl: string;
};

export const FALLBACK_SITE_CONFIG: SiteConfig = {
  name: "Saqia",
  slogan: "L’eau au bon endroit.",
  tagline: "Pompes & irrigation — devis sur WhatsApp",
  whatsappNumber: "212600000000",
  phoneDisplay: "+212 6 00 00 00 00",
  phoneRaw: "+212600000000",
  email: "contact@saqia.com",
  address: "Casablanca, Maroc — livraison nationale",
  hours: "Lun – Sam · 8h30 – 18h30",
  siteUrl: "https://saqia.site",
};

function text(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const MOROCCO_COUNTRY_CODE = "212";

/**
 * Numéro international en chiffres seuls (norme E.164 : 8 à 15 chiffres,
 * indicatif pays sans 0 initial), sinon `undefined`.
 * Accepte « +212 6… », « 00212 6… », « +212 (0)6… » et le format national
 * marocain « 06 12 34 56 78 ».
 */
export function phoneDigits(value: string | undefined): string | undefined {
  const raw = text(value)?.replace(/\(0\)/g, "");
  let digits = raw?.replace(/\D/g, "");
  if (!digits) return undefined;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith("0")) {
    digits = MOROCCO_COUNTRY_CODE + digits.slice(1);
  }

  const valid = !digits.startsWith("0") && digits.length >= 8 && digits.length <= 15;
  return valid ? digits : undefined;
}

/** Avertit au build / côté serveur uniquement, jamais dans la console des visiteurs. */
function warnInvalid(variable: SiteEnvKey): void {
  if (typeof window === "undefined") {
    console.warn(`[site-config] ${variable} invalide : valeur de repli utilisée.`);
  }
}

function absoluteUrl(value: string | undefined): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href.replace(/\/+$/, "")
      : undefined;
  } catch {
    return undefined;
  }
}

export function readSiteConfig(env: SiteEnv): SiteConfig {
  const fallback = FALLBACK_SITE_CONFIG;
  const whatsappNumber = phoneDigits(env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const phone = text(env.NEXT_PUBLIC_PHONE);
  const phoneNumber = phoneDigits(phone);

  if (text(env.NEXT_PUBLIC_WHATSAPP_NUMBER) && !whatsappNumber) {
    warnInvalid("NEXT_PUBLIC_WHATSAPP_NUMBER");
  }
  if (phone && !phoneNumber) {
    warnInvalid("NEXT_PUBLIC_PHONE");
  }

  return {
    name: fallback.name,
    slogan: fallback.slogan,
    tagline: fallback.tagline,
    whatsappNumber: whatsappNumber ?? fallback.whatsappNumber,
    phoneDisplay: phone && phoneNumber ? phone : fallback.phoneDisplay,
    phoneRaw: phoneNumber ? `+${phoneNumber}` : fallback.phoneRaw,
    email: text(env.NEXT_PUBLIC_CONTACT_EMAIL) ?? fallback.email,
    address: text(env.NEXT_PUBLIC_ADDRESS) ?? fallback.address,
    hours: text(env.NEXT_PUBLIC_HOURS) ?? fallback.hours,
    siteUrl: absoluteUrl(env.NEXT_PUBLIC_SITE_URL) ?? fallback.siteUrl,
  };
}

// Chaque variable est lue littéralement : Next ne remplace dans le code client
// que les accès `process.env.NEXT_PUBLIC_X` écrits en toutes lettres.
export const siteConfig: SiteConfig = readSiteConfig({
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_PHONE: process.env.NEXT_PUBLIC_PHONE,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_ADDRESS: process.env.NEXT_PUBLIC_ADDRESS,
  NEXT_PUBLIC_HOURS: process.env.NEXT_PUBLIC_HOURS,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export function whatsappUrl(
  message: string,
  number: string = siteConfig.whatsappNumber,
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
