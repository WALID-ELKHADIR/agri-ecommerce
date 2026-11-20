import { Mail, Phone, Trash, WhatsApp } from "@/components/icons";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import type { AdminQuote, QuoteStatus } from "@/lib/admin-data";
import { whatsappReplyUrl } from "@/lib/admin/whatsapp-reply";
import { deleteQuoteAction, updateQuoteStatusAction } from "@/lib/actions/quotes";
import { ConfirmSubmit } from "./confirm-submit";

export const STATUS: Record<QuoteStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "Nouvelle", tone: "water" },
  contacted: { label: "Contactée", tone: "harvest" },
  won: { label: "Gagnée", tone: "field" },
  lost: { label: "Perdue", tone: "neutral" },
};

export const STATUS_ORDER: QuoteStatus[] = ["new", "contacted", "won", "lost"];

/** Étape suivante proposée en un clic depuis le kanban. */
const NEXT: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
  new: ["contacted"],
  contacted: ["won", "lost"],
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Casablanca",
});

/** Demande de devis : coordonnées, produits demandés, message, réponse WhatsApp, statut. */
export function QuoteCard({
  quote,
  productNames,
  compact = false,
}: {
  quote: AdminQuote;
  productNames: Map<string, string>;
  compact?: boolean;
}) {
  const products = quote.items?.length
    ? quote.items.map((item) => `${item.name} × ${item.quantity}`)
    : quote.productSlug
      ? [`${productNames.get(quote.productSlug) ?? quote.productSlug}${quote.quantity ? ` × ${quote.quantity}` : ""}`]
      : [];
  const reply = whatsappReplyUrl({
    phone: quote.phone,
    name: quote.name,
    product: products.length === 1 ? products[0].replace(/ × \d+$/, "") : null,
  });

  return (
    <article className="grid gap-3 rounded-card border border-soil-200 bg-white p-4 shadow-soft">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-soil-900">{quote.name || "Visiteur sans nom"}</h3>
          <p className="text-xs text-soil-500">
            {dateFormat.format(new Date(quote.createdAt))} · {quote.source}
            {quote.profile ? ` · ${quote.profile}` : ""}
          </p>
        </div>
        <Badge tone={STATUS[quote.status].tone}>{STATUS[quote.status].label}</Badge>
      </header>

      {products.length > 0 ? (
        <ul className="grid gap-1 text-sm text-soil-800">
          {products.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}

      {quote.message && !compact ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-soil-600">{quote.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {quote.phone ? (
          <a href={`tel:${quote.phone}`} className="inline-flex min-h-11 items-center gap-1.5 text-soil-700 hover:text-water-700 sm:min-h-0">
            <Phone className="h-4 w-4" />
            {quote.phone}
          </a>
        ) : null}
        {quote.email ? (
          <a href={`mailto:${quote.email}`} className="inline-flex min-h-11 items-center gap-1.5 text-soil-700 hover:text-water-700 sm:min-h-0">
            <Mail className="h-4 w-4" />
            {quote.email}
          </a>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-soil-100 pt-3">
        {reply ? (
          <a href={reply} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "whatsapp", size: "sm" })}>
            <WhatsApp className="h-4 w-4" />
            Répondre sur WhatsApp
          </a>
        ) : null}

        {compact ? (
          (NEXT[quote.status] ?? []).map((status) => (
            <StatusButton key={status} id={quote.id} status={status} />
          ))
        ) : (
          <form action={updateQuoteStatusAction} className="flex items-center gap-1.5">
            <input type="hidden" name="id" value={quote.id} />
            <label className="sr-only" htmlFor={`status-${quote.id}`}>
              Statut de la demande
            </label>
            <select
              id={`status-${quote.id}`}
              name="status"
              defaultValue={quote.status}
              className="min-h-11 rounded-control border border-soil-300 bg-white px-2 text-sm sm:min-h-9"
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS[status].label}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Mettre à jour
            </button>
          </form>
        )}

        <div className="ml-auto">
          <ConfirmSubmit
            action={deleteQuoteAction}
            id={quote.id}
            message="Supprimer définitivement cette demande ?"
            className="flex h-11 w-11 items-center justify-center rounded-control text-soil-500 hover:bg-danger-50 hover:text-danger-700 sm:h-9 sm:w-9"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Supprimer la demande</span>
          </ConfirmSubmit>
        </div>
      </footer>
    </article>
  );
}

function StatusButton({ id, status }: { id: string; status: QuoteStatus }) {
  return (
    <form action={updateQuoteStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
        → {STATUS[status].label}
      </button>
    </form>
  );
}
