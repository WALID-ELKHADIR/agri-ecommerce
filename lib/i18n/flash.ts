/**
 * Messages après une action de l'admin : la Server Action pose une clé dans
 * l'URL (`?ok=productSaved`, `?error=idExists~pompes`), l'écran l'affiche dans
 * la langue de l'administrateur. Une valeur inconnue (message d'erreur de la
 * base de données) s'affiche telle quelle.
 */
import type { AdminDictionary } from "./admin-fr.ts";

type Flash = AdminDictionary["flash"];
export type FlashKey = Exclude<keyof Flash, "failedTitle">;

const SEPARATOR = "~";

export function flashCode(key: FlashKey, arg?: string | number): string {
  return arg === undefined ? key : `${key}${SEPARATOR}${arg}`;
}

/** Lecture d'une clé venue de l'URL : jamais une propriété héritée (__proto__, toString…). */
export function lookup<T>(record: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

export function flashText(flash: Flash, value: string): string {
  if (value === "1") return flash.saved;
  const at = value.indexOf(SEPARATOR);
  const key = at === -1 ? value : value.slice(0, at);
  if (!Object.hasOwn(flash, key)) return value;
  const entry = flash[key as keyof Flash] as unknown;
  if (typeof entry === "string") return entry;
  if (typeof entry === "function") return (entry as (arg: string) => string)(at === -1 ? "" : value.slice(at + 1));
  return value;
}
