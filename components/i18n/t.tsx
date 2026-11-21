import { ar } from "@/lib/i18n/ar";
import { fr, type TextKey } from "@/lib/i18n/fr";

/**
 * Texte traduit, rendu dans les deux langues : le CSS (app/globals.css)
 * n'affiche que celle de `<html lang>`. Aucun JavaScript, aucun saut au
 * changement de langue, utilisable dans les composants serveur et client.
 */
export function T({ k }: { k: TextKey }) {
  return <Tx fr={fr[k]} ar={ar[k]} />;
}

/** Variante pour un texte déjà calculé (avec une valeur, par exemple). */
export function Tx({ fr: french, ar: arabic }: { fr: string; ar: string }) {
  return (
    <>
      <span data-l="fr" lang="fr">
        {french}
      </span>
      {/* data-nosnippet : texte caché en français, jamais repris dans les extraits Google. */}
      <span data-l="ar" lang="ar" dir="rtl" data-nosnippet="">
        {arabic}
      </span>
    </>
  );
}
