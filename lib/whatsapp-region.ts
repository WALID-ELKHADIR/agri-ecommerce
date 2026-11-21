/**
 * Routage WhatsApp par région (préparé, non branché dans l'interface).
 * Les numéros par région sont saisis dans l'admin (Réglages) ; un numéro
 * invalide ou une région inconnue renvoie au numéro par défaut.
 */
import { slugify } from "./slugify.ts";

const VALID_NUMBER = /^[1-9]\d{7,14}$/;

export function resolveWhatsappNumber(
  settings: { whatsappNumber: string; whatsappRegions: { region: string; number: string }[] },
  region: string | undefined,
): string {
  const key = slugify(region ?? "");
  if (!key) return settings.whatsappNumber;
  const match = settings.whatsappRegions.find((entry) => slugify(entry.region) === key);
  const digits = match?.number.replace(/\D/g, "") ?? "";
  return VALID_NUMBER.test(digits) ? digits : settings.whatsappNumber;
}
