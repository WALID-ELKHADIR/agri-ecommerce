"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getPublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type QuoteRequestInput = {
  name?: string;
  phone?: string;
  email?: string;
  profile?: string;
  productSlug?: string;
  quantity?: number;
  message?: string;
  source?: string;
};

function clean(value: string | undefined, max = 500) {
  return (value ?? "").trim().slice(0, max);
}

/** Enregistre une demande de devis (accessible sans compte, via RLS insert-only). */
export async function saveQuoteRequest(input: QuoteRequestInput) {
  const supabase = getPublicClient();

  if (!supabase) {
    return { ok: false, reason: "not-configured" as const };
  }

  const name = clean(input.name, 120);
  const phone = clean(input.phone, 40);
  const email = clean(input.email, 160);
  const message = clean(input.message, 2000);
  const profile = clean(input.profile, 120);
  const productSlug = clean(input.productSlug, 160);

  if (!name && !phone && !email && !message) {
    return { ok: false, reason: "empty" as const };
  }

  const { error } = await supabase.from("quote_requests").insert({
    name: name || null,
    phone: phone || null,
    email: email || null,
    profile: profile || null,
    product_slug: productSlug || null,
    quantity: input.quantity && input.quantity > 0 ? input.quantity : null,
    message: message || null,
    source: clean(input.source, 40) || "site",
  });

  if (error) {
    console.error("[quotes] insertion impossible", error);
    return { ok: false, reason: error.message };
  }

  return { ok: true as const };
}

export async function updateQuoteStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !["new", "contacted", "won", "lost"].includes(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("quote_requests").update({ status }).eq("id", id);
  revalidatePath("/admin/demandes");
}

export async function deleteQuoteAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("quote_requests").delete().eq("id", id);
  revalidatePath("/admin/demandes");
}
