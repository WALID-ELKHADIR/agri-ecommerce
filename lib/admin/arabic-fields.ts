/**
 * Champs arabes facultatifs des formulaires de l'admin → colonnes *_ar
 * (migration 20261124100000_contenu_arabe.sql). Module pur.
 */
import { parseSpecs, type Spec } from "../i18n/localize-catalog.ts";

/**
 * Colonne inexistante (migration du contenu arabe pas encore appliquée) :
 * 42703 en lecture (Postgres), PGRST204 en écriture (cache de schéma PostgREST).
 */
export function isMissingColumn(error: { code?: string } | null | undefined): boolean {
  return error?.code === "42703" || error?.code === "PGRST204";
}

type Read = (name: string) => string;

const text = (read: Read, name: string, max: number): string | null => read(name).trim().slice(0, max) || null;

export function productArabicColumns(read: Read): {
  name_ar: string | null;
  description_ar: string | null;
  specs_ar: Spec[] | null;
} {
  const specs = parseSpecs(read("specs_ar"));
  return {
    name_ar: text(read, "name_ar", 160),
    description_ar: text(read, "description_ar", 2000),
    specs_ar: specs.length > 0 ? specs : null,
  };
}

export function categoryArabicColumns(read: Read): {
  label_ar: string | null;
  short_ar: string | null;
  description_ar: string | null;
} {
  return {
    label_ar: text(read, "label_ar", 80),
    short_ar: text(read, "short_ar", 40),
    description_ar: text(read, "description_ar", 400),
  };
}

/** Même enregistrement sans les colonnes arabes, pour une base pas encore migrée. */
export function stripArabic<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => !key.endsWith("_ar"))) as Partial<T>;
}
