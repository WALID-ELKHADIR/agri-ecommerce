"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash, WhatsApp } from "@/components/icons";
import { Sheet } from "@/components/ui/dialog";
import { saveQuoteRequest } from "@/lib/actions/quotes";
import { quoteList } from "@/lib/quote-list-store";
import { quoteListMessage, whatsappLink } from "@/lib/whatsapp";
import { useWhatsappContact } from "@/components/whatsapp-provider";
import { onOpenQuoteDrawer, useQuoteList } from "./use-quote-list";

const inputClass =
  "min-h-11 w-full rounded-xl border border-soil-300 bg-white px-3.5 py-2.5 text-sm text-soil-900 placeholder:text-soil-500 focus:border-water-500";

/** Tiroir récapitulatif de la liste de devis, envoyée en un seul message WhatsApp. */
export function QuoteDrawer() {
  const { number, brandName } = useWhatsappContact();
  const { lines, count } = useQuoteList();
  const [open, setOpen] = useState(false);
  // Après l'envoi, la liste est gardée : rien ne garantit que WhatsApp s'est
  // ouvert (navigateur intégré, bloqueur). Le visiteur la vide lui-même.
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  useEffect(
    () =>
      onOpenQuoteDrawer(() => {
        setSent(false);
        setOpen(true);
      }),
    [],
  );

  const message = quoteListMessage(lines, { name, city }, brandName);

  // Un vrai lien (et non window.open) : les bloqueurs de fenêtres ne l'arrêtent pas.
  function logRequest() {
    void saveQuoteRequest({
      source: "liste-devis",
      name: name.trim() || undefined,
      message,
      items: lines.map((line) => ({ slug: line.slug, name: line.name, quantity: line.quantity })),
    }).catch(() => {});
    setSent(true);
  }

  return (
    // Pas encore traduit : reste en français, de gauche à droite.
    <div lang="fr" dir="ltr" className="contents">
    <Sheet
      side="right"
      open={open}
      onClose={() => setOpen(false)}
      title="Ma liste de devis"
      description={
        count > 0
          ? `${count} article${count > 1 ? "s" : ""} — un seul message WhatsApp, devis gratuit.`
          : undefined
      }
      footer={
        lines.length > 0 ? (
          <div className="grid w-full gap-2">
            {sent ? (
              <p role="status" className="text-sm text-soil-700">
                Votre liste a été préparée dans WhatsApp. Une fois le message envoyé, vous pouvez vider la liste.
              </p>
            ) : null}
            <a
              href={whatsappLink(message, number)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={logRequest}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
            >
              <WhatsApp className="h-4 w-4" />
              {sent ? "Rouvrir WhatsApp" : "Envoyer sur WhatsApp"}
            </a>
            {sent ? (
              <button
                type="button"
                onClick={() => {
                  quoteList.clear();
                  setSent(false);
                  setOpen(false);
                }}
                className="min-h-11 w-full rounded-xl border border-soil-300 bg-white px-4 text-sm font-semibold text-soil-900 hover:border-water-300"
              >
                Vider la liste
              </button>
            ) : null}
          </div>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <div className="grid gap-3 py-6 text-center">
          <p className="text-sm text-soil-600">Votre liste est vide.</p>
          <Link
            href="/produits"
            onClick={() => setOpen(false)}
            className="mx-auto inline-flex min-h-11 items-center rounded-full border border-soil-300 px-4 text-sm font-semibold text-soil-900 hover:border-water-300"
          >
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          <ul className="grid gap-2">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center gap-3 rounded-xl border border-soil-200 bg-white p-3">
                <Link
                  href={`/produits/${line.slug}`}
                  onClick={() => setOpen(false)}
                  className="min-w-0 flex-1 text-sm font-semibold text-soil-900 hover:text-water-700"
                >
                  {line.name}
                </Link>
                <div className="flex items-center gap-1 rounded-full border border-soil-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => quoteList.setQuantity(line.slug, line.quantity - 1)}
                    aria-label={`Diminuer la quantité de ${line.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-soil-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => quoteList.setQuantity(line.slug, line.quantity + 1)}
                    aria-label={`Augmenter la quantité de ${line.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-soil-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => quoteList.remove(line.slug)}
                  aria-label={`Retirer ${line.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-danger-700 hover:bg-danger-50"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
              Nom (facultatif)
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={inputClass} />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
              Ville (facultatif)
              <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} autoComplete="address-level2" className={inputClass} />
            </label>
          </div>
          <p className="text-xs text-soil-500">
            WhatsApp s&apos;ouvre avec votre liste prête à envoyer. Nous vous répondons avec les prix et la disponibilité.
          </p>
        </div>
      )}
    </Sheet>
    </div>
  );
}
