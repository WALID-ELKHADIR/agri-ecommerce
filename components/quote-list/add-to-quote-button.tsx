"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "@/components/icons";
import { cn } from "@/lib/cn";
import { quoteList } from "@/lib/quote-list-store";
import { announceQuoteAdded } from "./use-quote-list";

type AddToQuoteButtonProps = {
  product: { slug: string; name: string };
  quantity?: number;
  size?: "sm" | "md";
  className?: string;
};

/** Ajoute un produit à la liste de devis, avec un retour visuel bref. */
export function AddToQuoteButton({ product, quantity = 1, size = "md", className }: AddToQuoteButtonProps) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1500);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        quoteList.add(product, quantity);
        announceQuoteAdded();
        setAdded(true);
      }}
      aria-label={`Ajouter « ${product.name} » à ma liste de devis`}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition active:scale-[0.97]",
        size === "sm" ? "min-h-11 px-3.5 text-xs sm:min-h-9" : "min-h-12 px-5 text-sm",
        added
          ? "bg-field-700 text-white"
          : "border border-field-900/15 bg-field-900 text-white hover:bg-field-800",
        className,
      )}
    >
      {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      <span aria-live="polite">{added ? "Ajouté" : "Ajouter au devis"}</span>
    </button>
  );
}
