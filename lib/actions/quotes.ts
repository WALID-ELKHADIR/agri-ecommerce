"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { type QuoteRequestInput, validateQuoteInput } from "@/lib/quote-validation";
import { getPublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type { QuoteRequestInput };

export type SaveQuoteResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "empty" | "invalid" | "rate-limited" | "error"; message?: string };

const RATE_LIMITED_MESSAGE =
  "Trop de demandes, réessayez dans quelques minutes ou écrivez-nous sur WhatsApp.";

/** Enregistre une demande de devis (accessible sans compte, via RLS insert-only). */
export async function saveQuoteRequest(input: QuoteRequestInput): Promise<SaveQuoteResult> {
  const validation = validateQuoteInput(input, Date.now());

  if (!validation.ok) {
    // Robot probable : on répond comme si tout allait bien, sans rien enregistrer.
    return validation.reason === "spam" ? { ok: true } : { ok: false, reason: validation.reason };
  }

  const supabase = getPublicClient();
  if (!supabase) {
    return { ok: false, reason: "not-configured" };
  }

  const { error } = await supabase.from("quote_requests").insert(validation.data);

  if (error) {
    if (error.message.includes("rate_limited")) {
      return { ok: false, reason: "rate-limited", message: RATE_LIMITED_MESSAGE };
    }
    console.error("[quotes] insertion impossible", error);
    return { ok: false, reason: "error" };
  }

  return { ok: true };
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
