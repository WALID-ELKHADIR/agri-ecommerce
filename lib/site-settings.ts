import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  mergeSiteSettings,
  type ContactSettings,
  type SiteSettings,
  type WhatsappRegion,
} from "@/lib/settings-merge";
import { siteConfig } from "@/lib/site-config";
import { getPublicClient } from "@/lib/supabase/public";

export type { SiteSettings };

/** Réglages enregistrés en base, tels quels (pour le formulaire de l'admin). */
export async function getStoredSettings(): Promise<{ contact: ContactSettings; regions: WhatsappRegion[] }> {
  const supabase = getPublicClient();
  if (!supabase) return { contact: {}, regions: [] };
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error || !data) return { contact: {}, regions: [] };

  const rows = data as { key: string; value: unknown }[];
  const contact = rows.find((row) => row.key === "contact")?.value;
  const regions = rows.find((row) => row.key === "whatsapp_regions")?.value;
  return {
    contact: contact && typeof contact === "object" && !Array.isArray(contact) ? (contact as ContactSettings) : {},
    regions: Array.isArray(regions) ? (regions as WhatsappRegion[]) : [],
  };
}

/**
 * Coordonnées et numéros WhatsApp du site : réglages de l'admin s'ils sont
 * renseignés, sinon variables NEXT_PUBLIC_*. Mis en cache, invalidé par le tag
 * « settings » à chaque enregistrement.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  try {
    const { contact, regions } = await getStoredSettings();
    return mergeSiteSettings(siteConfig, contact, regions);
  } catch {
    return mergeSiteSettings(siteConfig, {}, []);
  }
}
