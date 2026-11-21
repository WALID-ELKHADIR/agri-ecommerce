import { Check, Plus } from "@/components/icons";
import { cn } from "@/lib/cn";

type AddToQuoteButtonProps = {
  product: { slug: string; name: string };
  quantity?: number;
  size?: "sm" | "md";
  className?: string;
  /** Textes dans la langue de la page (dictionnaire lib/i18n, fourni par l'appelant). */
  labels: { add: string; added: string; aria: string };
};

/**
 * Bouton « Ajouter au devis », rendu sans JavaScript propre : le clic est
 * traité par l'écouteur global (components/click-tracker.tsx), qui pose
 * `data-added` pendant 1,5 s pour afficher « Ajouté ».
 */
export function AddToQuoteButton({ product, quantity = 1, size = "md", className, labels }: AddToQuoteButtonProps) {
  return (
    <button
      type="button"
      data-quote-add=""
      data-slug={product.slug}
      data-name={product.name}
      data-qty={quantity}
      aria-label={labels.aria}
      className={cn(
        "group/add inline-flex items-center justify-center gap-1.5 rounded-full border border-field-900/15 bg-field-900 font-semibold text-white transition hover:bg-field-800 active:scale-[0.97] data-[added=true]:bg-field-700",
        size === "sm" ? "min-h-11 px-3.5 text-xs sm:min-h-9" : "min-h-12 px-5 text-sm",
        className,
      )}
    >
      <Plus className="h-4 w-4 group-data-[added=true]/add:hidden" />
      <Check className="hidden h-4 w-4 group-data-[added=true]/add:block" />
      <span className="group-data-[added=true]/add:hidden">{labels.add}</span>
      <span className="hidden group-data-[added=true]/add:inline" aria-live="polite">
        {labels.added}
      </span>
    </button>
  );
}
