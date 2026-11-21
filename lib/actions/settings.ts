"use server";

import { updateTag } from "next/cache";
import { revalidateLocalized } from "@/lib/i18n/revalidate";
import { flashCode } from "@/lib/i18n/flash";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { parseRegions, type ContactSettings } from "@/lib/settings-merge";
import { phoneDigits } from "@/lib/site-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function fail(message: string): never {
  redirect(`/admin/reglages?error=${encodeURIComponent(message)}`);
}

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

/** Enregistre coordonnées et numéros WhatsApp ; un champ vide reprend la valeur par défaut. */
export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();

  const contact: ContactSettings = {
    whatsappNumber: field(formData, "whatsappNumber", 30),
    phone: field(formData, "phone", 30),
    email: field(formData, "email", 160),
    address: field(formData, "address", 200),
    hours: field(formData, "hours", 120),
  };

  if (contact.whatsappNumber && !phoneDigits(contact.whatsappNumber)) {
    fail(flashCode("invalidWhatsapp"));
  }
  if (contact.phone && !phoneDigits(contact.phone)) {
    fail(flashCode("invalidPhone"));
  }
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    fail(flashCode("invalidEmail"));
  }

  const regions = parseRegions(field(formData, "regions", 4000)).slice(0, 30);
  const invalid = regions.find((region) => !phoneDigits(region.number));
  if (invalid) fail(flashCode("invalidRegion", invalid.region));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("settings").upsert([
    { key: "contact", value: contact },
    { key: "whatsapp_regions", value: regions },
  ]);
  if (error) fail(error.message);

  updateTag("settings");
  revalidateLocalized("/", "layout");
  redirect(`/admin/reglages?ok=${flashCode("settingsSaved")}`);
}
