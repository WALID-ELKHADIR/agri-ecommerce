import Link from "next/link";
import { Suspense } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AdminHeader, SetupNotice } from "@/components/admin/dashboard";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Mail, Phone, Trash, WhatsApp } from "@/components/icons";
import {
  deleteQuoteAction,
  updateQuoteStatusAction,
} from "@/lib/actions/quotes";
import { listQuoteRequests } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const statusLabels: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  won: "Gagné",
  lost: "Perdu",
};

const statusStyles: Record<string, string> = {
  new: "bg-cyan-50 text-cyan-700",
  contacted: "bg-amber-50 text-amber-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-slate-100 text-slate-500",
};

export default function DemandesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DemandesContent />
    </Suspense>
  );
}

function waLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

async function DemandesContent() {
  await requireAdmin();

  const { quotes, error } = await listQuoteRequests();

  return (
    <div className="space-y-4">
      <SetupNotice error={error} />

      <AdminHeader
        title="Demandes de devis"
        description="Chaque demande envoyée depuis WhatsApp ou le formulaire du site."
      />

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-[#0A2540]">
            Aucune demande pour le moment.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Les demandes arrivent ici dès qu’un visiteur envoie le formulaire de
            contact.
          </p>
          <Link
            href="/contact"
            target="_blank"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#0A2540]"
          >
            Voir le formulaire public
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <article
              key={quote.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-[#0A2540]">
                      {quote.name || "Visiteur"}
                    </h2>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        statusStyles[quote.status] ?? statusStyles.new
                      }`}
                    >
                      {statusLabels[quote.status] ?? quote.status}
                    </span>
                    {quote.productSlug ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {quote.productSlug}
                        {quote.quantity ? ` × ${quote.quantity}` : ""}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {quote.phone ? (
                      <a
                        href={`tel:${quote.phone}`}
                        className="inline-flex items-center gap-1.5 hover:text-cyan-700"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {quote.phone}
                      </a>
                    ) : null}
                    {quote.email ? (
                      <a
                        href={`mailto:${quote.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-cyan-700"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {quote.email}
                      </a>
                    ) : null}
                    {quote.profile ? <span>{quote.profile}</span> : null}
                    <span>
                      {new Date(quote.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {quote.message ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {quote.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {quote.phone ? (
                    <a
                      href={waLink(quote.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1FA855] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#178f47]"
                    >
                      <WhatsApp className="h-3.5 w-3.5" />
                      Répondre
                    </a>
                  ) : null}

                  <form
                    action={updateQuoteStatusAction}
                    className="flex items-center gap-1.5"
                  >
                    <input type="hidden" name="id" value={quote.id} />
                    <label className="sr-only" htmlFor={`status-${quote.id}`}>
                      Statut de la demande
                    </label>
                    <select
                      id={`status-${quote.id}`}
                      name="status"
                      defaultValue={quote.status}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-[#0A2540]"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-[#0A2540] transition hover:border-cyan-300"
                    >
                      OK
                    </button>
                  </form>

                  <ConfirmSubmit
                    action={deleteQuoteAction}
                    id={quote.id}
                    message="Supprimer définitivement cette demande ?"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash className="h-4 w-4" />
                  </ConfirmSubmit>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
