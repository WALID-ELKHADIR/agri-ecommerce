import { Mail, Phone, Trash, WhatsApp } from "@/components/icons";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import type { AdminQuote, QuoteStatus } from "@/lib/admin-data";
import { whatsappReplyUrl } from "@/lib/admin/whatsapp-reply";
import { deleteQuoteAction, updateQuoteStatusAction } from "@/lib/actions/quotes";
import { ConfirmSubmit } from "./confirm-submit";
import type { AdminDictionary } from "@/lib/i18n/admin-fr";
import { getAdminDictionary } from "@/lib/i18n/server";

/** Couleur du badge de chaque statut (le libellé vient du dictionnaire de l'admin). */
const STATUS_TONE: Record<QuoteStatus, BadgeTone> = {
  new: "water",
  contacted: "harvest",
  won: "field",
  lost: "neutral",
};

export const STATUS_ORDER: QuoteStatus[] = ["new", "contacted", "won", "lost"];

/** Étape suivante proposée en un clic depuis le kanban. */
const NEXT: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
  new: ["contacted"],
  contacted: ["won", "lost"],
};


/** Demande de devis : coordonnées, produits demandés, message, réponse WhatsApp, statut. */
export async function QuoteCard({
  quote,
  productNames,
  compact = false,
}: {
  quote: AdminQuote;
  productNames: Map<string, string>;
  compact?: boolean;
}) {
  const t = await getAdminDictionary();
  const q = t.quotes;
  const dateFormat = new Intl.DateTimeFormat(t.dateLocale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
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
          <h3 className="font-semibold text-soil-900">{quote.name || t.common.visitorNoName}</h3>
          <p className="text-xs text-soil-500">
            {dateFormat.format(new Date(quote.createdAt))} · {q.sources[quote.source] ?? quote.source}
            {quote.profile ? ` · ${quote.profile}` : ""}
          </p>
        </div>
        <Badge tone={STATUS_TONE[quote.status]}>{q.statuses[quote.status]}</Badge>
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
            <bdi dir="ltr">{quote.phone}</bdi>
          </a>
        ) : null}
        {quote.email ? (
          <a href={`mailto:${quote.email}`} className="inline-flex min-h-11 items-center gap-1.5 text-soil-700 hover:text-water-700 sm:min-h-0">
            <Mail className="h-4 w-4" />
            <bdi dir="ltr">{quote.email}</bdi>
          </a>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-soil-100 pt-3">
        {reply ? (
          <a href={reply} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "whatsapp", size: "sm" })}>
            <WhatsApp className="h-4 w-4" />
            {q.reply}
          </a>
        ) : null}

        {compact ? (
          (NEXT[quote.status] ?? []).map((status) => (
            <StatusButton key={status} id={quote.id} status={status} labels={q.statuses} />
          ))
        ) : (
          <form action={updateQuoteStatusAction} className="flex items-center gap-1.5">
            <input type="hidden" name="id" value={quote.id} />
            <label className="sr-only" htmlFor={`status-${quote.id}`}>
              {q.statusLabel}
            </label>
            <select
              id={`status-${quote.id}`}
              name="status"
              defaultValue={quote.status}
              className="min-h-11 rounded-control border border-soil-300 bg-white px-2 text-sm sm:min-h-9"
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {q.statuses[status]}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              {q.update}
            </button>
          </form>
        )}

        <div className="ms-auto">
          <ConfirmSubmit
            action={deleteQuoteAction}
            id={quote.id}
            message={q.deleteConfirm}
            className="flex h-11 w-11 items-center justify-center rounded-control text-soil-500 hover:bg-danger-50 hover:text-danger-700 sm:h-9 sm:w-9"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">{q.deleteLabel}</span>
          </ConfirmSubmit>
        </div>
      </footer>
    </article>
  );
}

function StatusButton({ id, status, labels }: { id: string; status: QuoteStatus; labels: AdminDictionary["quotes"]["statuses"] }) {
  return (
    <form action={updateQuoteStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
        <span aria-hidden="true" className="rtl:-scale-x-100">→</span> {labels[status]}
      </button>
    </form>
  );
}
