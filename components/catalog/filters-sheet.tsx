"use client";

import { useState, type ReactNode } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { FilterIcon } from "@/components/icons";
import { Sheet } from "@/components/ui/dialog";

/** Bouton « Filtres » (mobile) qui ouvre le formulaire de filtres dans un tiroir. */
export function FiltersSheet({ active, children }: { active: number; children: ReactNode }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-soil-300 bg-white px-4 text-sm font-semibold text-soil-900 md:hidden"
      >
        <FilterIcon className="h-4 w-4" />
        {t.catalogPage.filters}
        {active > 0 ? ` (${active})` : ""}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t.catalogPage.filtersTitle}>
        {children}
      </Sheet>
    </>
  );
}
