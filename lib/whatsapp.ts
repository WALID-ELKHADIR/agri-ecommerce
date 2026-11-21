/**
 * Seul endroit qui construit les messages et les liens WhatsApp du site
 * (module pur, testé dans tests/whatsapp.test.ts). Les textes viennent du
 * dictionnaire de la langue du visiteur (français par défaut).
 */
import { fr, type Dictionary } from "./i18n/fr.ts";

export type WhatsappLine = { name: string; quantity: number; slug?: string };

/** Textes des messages, dans la langue du visiteur. */
export type WhatsappCopy = Pick<
  Dictionary,
  | "whatsappGeneral"
  | "waProductIntro"
  | "waProductWant"
  | "waProductThanks"
  | "waListIntro"
  | "waListThanks"
  | "waName"
  | "waCity"
  | "waMore"
>;

/** Longueur maximale d'un message : wa.me reste fiable bien en dessous de ~2 000 caractères. */
export const WHATSAPP_MESSAGE_MAX = 1800;

export function generalMessage(brandName: string, copy: Pick<WhatsappCopy, "whatsappGeneral"> = fr): string {
  return copy.whatsappGeneral(brandName);
}

export function productMessage(
  product: { name: string; slug: string },
  quantity: number,
  siteUrl: string,
  copy: WhatsappCopy = fr,
): string {
  const base = siteUrl.replace(/\/+$/, "");
  return [
    copy.waProductIntro,
    copy.waProductWant,
    `• ${quantity} × ${product.name}`,
    `${base}/produits/${product.slug}`,
    "",
    copy.waProductThanks,
  ].join("\n");
}

/** Message d'une liste de devis ; tronqué par lignes entières sous WHATSAPP_MESSAGE_MAX. */
export function quoteListMessage(
  lines: WhatsappLine[],
  contact: { name?: string; city?: string },
  brandName: string,
  copy: WhatsappCopy = fr,
): string {
  const head = [copy.waListIntro(brandName), copy.waProductWant];
  const tail = [
    "",
    ...(contact.name?.trim() ? [copy.waName(contact.name.trim())] : []),
    ...(contact.city?.trim() ? [copy.waCity(contact.city.trim())] : []),
    copy.waListThanks,
  ];
  const items = lines.map((line) => `• ${line.quantity} × ${line.name}`);

  const build = (shown: number) => {
    const rest = items.length - shown;
    const more = rest > 0 ? [copy.waMore(rest)] : [];
    return [...head, ...items.slice(0, shown), ...more, ...tail].join("\n");
  };

  let shown = items.length;
  while (shown > 0 && build(shown).length > WHATSAPP_MESSAGE_MAX) shown--;
  return build(shown);
}

/**
 * Lien wa.me. `region` est accepté pour le futur routage par région
 * (réglage « Numéros par région ») mais n'est pas encore utilisé.
 */
export function whatsappLink(message: string, number: string, region?: string): string {
  void region;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
