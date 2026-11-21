"use client";

import { useEffect, useState } from "react";
import { Check } from "@/components/icons";
import { onQuoteAdded, openQuoteDrawer } from "./use-quote-list";

const VISIBLE_MS = 3000;

/** Confirmation brève après un ajout au devis, avec un accès direct à la liste. */
export function QuoteToast() {
  const [name, setName] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer = 0;
    const stop = onQuoteAdded(({ name: added }) => {
      if (!added) return;
      setName(added);
      setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(false), VISIBLE_MS);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      // Caché : plus de clic ni de lecture (le texte précédent reste monté).
      inert={!visible}
      className={`pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center transition duration-300 md:bottom-6 ${
        visible ? "translate-y-0 opacity-100 [&>*]:pointer-events-auto" : "translate-y-2 opacity-0"
      }`}
    >
      {name ? (
        <div className="flex max-w-md items-center gap-3 rounded-2xl bg-field-900 px-4 py-3 text-sm text-white shadow-lg shadow-field-900/25">
          <Check className="h-4 w-4 shrink-0 text-water-300" />
          <p className="min-w-0 flex-1 truncate">{name} ajouté à votre liste</p>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              openQuoteDrawer();
            }}
            className="min-h-11 shrink-0 rounded-full px-3 font-semibold text-water-200 underline-offset-2 hover:underline"
          >
            Voir la liste
          </button>
        </div>
      ) : null}
    </div>
  );
}
