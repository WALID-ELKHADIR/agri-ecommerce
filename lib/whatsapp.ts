/**
 * Seul endroit qui construit les messages et les liens WhatsApp du site
 * (module pur, testé dans tests/whatsapp.test.ts).
 */

export type WhatsappLine = { name: string; quantity: number; slug?: string };

/** Longueur maximale d'un message : wa.me reste fiable bien en dessous de ~2 000 caractères. */
export const WHATSAPP_MESSAGE_MAX = 1800;

export function generalMessage(brandName: string): string {
  return `Bonjour ${brandName} 👋, je souhaite un devis pour du matériel d'irrigation / de pompage. Pouvez-vous m'aider ?`;
}

export function productMessage(product: { name: string; slug: string }, quantity: number, siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return [
    "Bonjour 👋,",
    "Je souhaite un devis pour :",
    `• ${quantity} × ${product.name}`,
    `${base}/produits/${product.slug}`,
    "",
    "Merci de me communiquer le prix, la disponibilité et le délai de livraison.",
  ].join("\n");
}

/** Message d'une liste de devis ; tronqué par lignes entières sous WHATSAPP_MESSAGE_MAX. */
export function quoteListMessage(
  lines: WhatsappLine[],
  contact: { name?: string; city?: string },
  brandName: string,
): string {
  const head = [`Bonjour ${brandName} 👋,`, "Je souhaite un devis pour :"];
  const tail = [
    "",
    ...(contact.name?.trim() ? [`Nom : ${contact.name.trim()}`] : []),
    ...(contact.city?.trim() ? [`Ville : ${contact.city.trim()}`] : []),
    "Merci de me communiquer les prix, la disponibilité et le délai de livraison.",
  ];
  const items = lines.map((line) => `• ${line.quantity} × ${line.name}`);

  const build = (shown: number) => {
    const rest = items.length - shown;
    const more = rest > 0 ? [`… et ${rest} autres produits`] : [];
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
