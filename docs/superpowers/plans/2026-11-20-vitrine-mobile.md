# Vitrine mobile-first : plan d'implémentation

> **Pour les agents :** sous-skill OBLIGATOIRE : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**But :** remplacer la vitrine actuelle, exécutée côté client, par des pages rendues par le serveur, rapides sur mobile. On y ajoute :
- une liste de devis multi-produits ;
- l'enregistrement de chaque clic WhatsApp ;
- un catalogue filtré par l'URL ;
- une fiche produit avec galerie à balayer.

**Architecture :**
- Les pages et les sections sont des composants serveur. L'interactivité se limite à de petites îles client : bouton d'ajout, tiroir, galerie, panneau de filtres, lien WhatsApp.
- La logique est dans des modules purs testés : `lib/whatsapp.ts`, `lib/quote-list-store.ts`, `lib/catalog-query.ts`.
- Aucune dépendance ni migration nouvelle.

**Stack :** Next.js 16.4 (Cache Components), React 19.3, Tailwind 4.3, Supabase, `node --test`, Playwright (vérification locale).

**Spec :** `docs/superpowers/specs/2026-11-20-vitrine-mobile-design.md`

## Contraintes globales
- Lire `node_modules/next/dist/docs/` avant chaque API Next. `searchParams` est lu dans un `<Suspense>` via `searchParams.then(...)`. Pas de `Date.now()` dans un rendu pré-calculé.
- **Aucun fait inventé.** Seuls sont permis :
  - les comptes calculés depuis les données ;
  - « livraison partout au Maroc », « conseil technique », « devis sous 24 h » ;
  - « devis gratuit sur WhatsApp ».

  « Garantie constructeur » est retiré. La section témoignages n'est pas affichée.
- Aucune nouvelle dépendance. Aucune migration. TypeScript strict : pas de `any` ni de `@ts-ignore`. Textes en français, vouvoiement.
- `priority` seulement sur le hero de `/` et la première image de la fiche produit. Toute image a un ratio fixe et un `sizes` exact.
- Valeurs de `source` (≤ 40 caractères) : `accueil-hero`, `accueil-cta`, `header`, `carte-produit`, `fiche-produit`, `barre-mobile`, `liste-devis`, `contact`, `footer`.
- Clé de stockage : `saqia:devis:v1`. Quantité de 1 à 99. Au plus 50 lignes.
- Commits atomiques en Conventional Commits français, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Avant chaque commit : `npx tsc --noEmit -p .`, `npm run lint`, `npm test` au vert.

## Points de vigilance (Review Focus)
1. **Stockage local indisponible ou corrompu** (navigation privée, JSON invalide, quota plein) : la liste fonctionne en mémoire, sans erreur. → test dans la tâche 3.
2. **Enregistrement en échec ou lent** (réseau 3G, limite de débit) : WhatsApp s'ouvre quand même, immédiatement. → test dans la tâche 2 : le `href` reste le lien `wa.me` et l'enregistrement ne bloque pas.
3. **Paramètres d'URL inconnus ou hostiles** (`?gamme=xxx`, `?tri=<script>`, `?q=` de 5 000 caractères) : ils sont ignorés ou bornés et la page s'affiche. → test dans la tâche 5.
4. **Message WhatsApp trop long** (50 lignes aux noms longs) : il est tronqué proprement sous la limite, avec « … et N autres produits ». → test dans la tâche 1.
5. **Produit retiré du catalogue alors qu'il est dans une liste enregistrée** : la ligne reste affichée avec son nom stocké et peut être envoyée ou retirée. → test dans la tâche 3 : le store garde `name` et ne dépend pas du catalogue.

---

### Task 1: `lib/whatsapp.ts`, seul constructeur de messages et de liens

**Fichiers :**
- Créer : `lib/whatsapp.ts`, `tests/whatsapp.test.ts`
- Modifier :
  - `lib/catalog.ts` : `whatsappLink`, `generalMessage` et `productMessage` deviennent des ré-exports de `lib/whatsapp.ts`, puis sont supprimés à la tâche 8 une fois les appels migrés ;
  - `lib/site-config.ts` : `whatsappUrl` délègue à `whatsappLink`.

**Interfaces produites :**
```ts
export type WhatsappLine = { name: string; quantity: number; slug?: string };
export const WHATSAPP_MESSAGE_MAX = 1800;
export function generalMessage(brandName: string): string;
export function productMessage(product: { name: string; slug: string }, quantity: number, siteUrl: string): string;
export function quoteListMessage(lines: WhatsappLine[], contact: { name?: string; city?: string }, brandName: string): string;
export function whatsappLink(message: string, number: string, region?: string): string; // region : accepté, non routé
```

- [ ] **Étape 1 : écrire les tests qui échouent** (`tests/whatsapp.test.ts`) :
  - `productMessage({ name: "Pompe immergée inox 4\"", slug: "pompe-immergee-inox-4-pouces" }, 2, "https://saqia.ma")` contient `2 × Pompe immergée inox 4"` et `https://saqia.ma/produits/pompe-immergee-inox-4-pouces` ;
  - `quoteListMessage([{name:"A",quantity:1},{name:"B",quantity:3}], { name: "Ali", city: "Agadir" }, "Saqia")` contient `• 1 × A`, `• 3 × B`, `Nom : Ali`, `Ville : Agadir` ;
  - sans nom ni ville, aucune ligne `Nom :` ou `Ville :` ;
  - 50 lignes de 150 caractères : `length <= WHATSAPP_MESSAGE_MAX`, se termine par `… et N autres produits`, avec N exact ;
  - `whatsappLink("a b&c", "212600000000")` === `https://wa.me/212600000000?text=a%20b%26c` ;
  - `whatsappLink(msg, num, "souss")` === `whatsappLink(msg, num)`.
- [ ] **Étape 2 :** `node --test tests/whatsapp.test.ts` → ÉCHEC (module introuvable).
- [ ] **Étape 3 : implémenter les signatures ci-dessus.** Tronquer en retirant des lignes entières, jamais au milieu d'un nom.
- [ ] **Étape 4 :** `npm test` → SUCCÈS. Puis `npx tsc --noEmit -p .` : les anciens appels compilent grâce aux ré-exports.
- [ ] **Étape 5 : commit** `feat(whatsapp): centralise les messages et liens WhatsApp (multi-produits, prêt pour les régions)`.

### Task 2: `WhatsAppLink`, chaque clic enregistré

**Fichiers :**
- Créer : `components/whatsapp-link.tsx` (client), `lib/quote-sources.ts`, `tests/quote-sources.test.ts`
- Modifier : `components/site-header.tsx`, `components/site-footer.tsx`, `components/mobile-cta.tsx`, `app/contact/page.tsx`

**Interfaces :**
- Consomme : `whatsappLink` (tâche 1), `saveQuoteRequest(input: QuoteRequestInput)` (`lib/actions/quotes.ts`, existant).
- Produit :
```ts
// lib/quote-sources.ts
export const QUOTE_SOURCES = ["accueil-hero","accueil-cta","header","carte-produit","fiche-produit","barre-mobile","liste-devis","contact","footer"] as const;
export type QuoteSource = (typeof QUOTE_SOURCES)[number];
export function clickRecord(source: QuoteSource, message: string, product?: { slug: string; quantity: number }): QuoteRequestInput;
// components/whatsapp-link.tsx
export function WhatsAppLink(props: { href: string; source: QuoteSource; message: string; product?: { slug: string; quantity: number }; className?: string; children: ReactNode; "aria-label"?: string }): JSX.Element;
```

- [ ] **Étape 1 : tests qui échouent** (`tests/quote-sources.test.ts`) :
  - pour chaque source, `source.length <= 40` ;
  - `clickRecord("header", "Bonjour")` passe `validateQuoteInput` avec `ok: true`, `source: "header"`, `message: "Bonjour"` ;
  - `clickRecord("carte-produit", "m", { slug: "x", quantity: 2 })` donne `productSlug: "x"`, `quantity: 2` ;
  - aucun champ `elapsedMs` : un clic n'est pas un formulaire.
- [ ] **Étape 2 :** `node --test tests/quote-sources.test.ts` → ÉCHEC.
- [ ] **Étape 3 : implémenter.** `WhatsAppLink` rend un `<a href target="_blank" rel="noopener noreferrer">`. Le `onClick` appelle `void saveQuoteRequest(clickRecord(...)).catch(() => {})`, sans `preventDefault` ni `await` : le lien s'ouvre toujours, même hors ligne.
- [ ] **Étape 4 : remplacer les liens `wa.me`** du header (`header`), du pied de page (`footer`), de `MobileCta` (`barre-mobile`) et de la page contact (`contact`). Le numéro vient des réglages (`brand.whatsappNumber` ou `getSiteSettings`), comme aujourd'hui.
- [ ] **Étape 5 :** `npm test`, `npm run lint`, `npx tsc --noEmit -p .` → SUCCÈS. **Commit** `feat(whatsapp): enregistre chaque clic WhatsApp comme demande avec sa source`.

### Task 3: store de la liste de devis

**Fichiers :**
- Créer : `lib/quote-list-store.ts`, `tests/quote-list-store.test.ts`

**Interfaces produites :**
```ts
export type QuoteLine = { slug: string; name: string; quantity: number };
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const QUOTE_LIST_KEY = "saqia:devis:v1";
export function createQuoteListStore(storage: () => StorageLike | null): {
  subscribe(listener: () => void): () => void;
  getSnapshot(): QuoteLine[];          // même référence tant que rien ne change
  getServerSnapshot(): QuoteLine[];    // tableau vide constant
  add(line: { slug: string; name: string }, quantity?: number): void;  // additionne, borne à 99
  setQuantity(slug: string, quantity: number): void;                   // 0 → retire ; borne 1..99
  remove(slug: string): void;
  clear(): void;
  count(): number;                     // somme des quantités
  syncFromStorage(): void;             // appelé sur l'événement « storage »
};
export const quoteList: ReturnType<typeof createQuoteListStore>; // instance navigateur (window.localStorage dans un try)
```

- [ ] **Étape 1 : tests qui échouent**, avec un faux `StorageLike` en mémoire :
  - `add` deux fois le même slug → une ligne, `quantity` 2 ;
  - `add(x, 150)` → 99 ;
  - 51ᵉ produit distinct ignoré : longueur 50 ;
  - `setQuantity(slug, 0)` retire la ligne ;
  - persistance : un nouveau store sur le même stockage relit les lignes ;
  - JSON corrompu dans le stockage → `[]`, sans exception ;
  - `getItem` ou `setItem` qui lèvent une exception → la liste marche en mémoire ;
  - `storage` qui renvoie `null` → idem ;
  - une ligne garde son `name`, même pour un slug inconnu du catalogue ;
  - `getSnapshot()` renvoie la même référence entre deux appels sans changement.
- [ ] **Étape 2 :** `node --test tests/quote-list-store.test.ts` → ÉCHEC.
- [ ] **Étape 3 : implémenter.** Valider la forme des lignes relues : on écarte celles qui sont invalides.
- [ ] **Étape 4 :** `npm test` → SUCCÈS. **Commit** `feat(devis): stockage local de la liste de devis, robuste aux erreurs`.

### Task 4: interface de la liste de devis

**Fichiers :**
- Créer :
  - `components/quote-list/add-to-quote-button.tsx` (client) ;
  - `components/quote-list/quote-drawer.tsx` (client) ;
  - `components/quote-list/quote-counter.tsx` (client, icône et compteur du header) ;
  - `components/quote-list/use-quote-list.ts`.
- Modifier :
  - `components/site-header.tsx` : compteur et ouverture du tiroir ;
  - `components/mobile-cta.tsx` : bouton « Ma liste (n) » quand la liste n'est pas vide ;
  - `lib/quote-validation.ts` : rien, sauf si le test ci-dessous échoue.

**Interfaces :**
- Consomme : `quoteList` (tâche 3), `quoteListMessage`, `whatsappLink` (tâche 1), `clickRecord` (tâche 2), `saveQuoteRequest`, `Dialog` (`components/ui/dialog.tsx`).
- Produit :
```ts
export function useQuoteList(): { lines: QuoteLine[]; count: number };
export function AddToQuoteButton(props: { product: { slug: string; name: string }; quantity?: number; size?: "sm" | "md"; className?: string }): JSX.Element;
export function QuoteDrawer(props: { whatsappNumber: string; brandName: string }): JSX.Element; // ouvert via openQuoteDrawer()
export function openQuoteDrawer(): void; // événement DOM « saqia:open-devis »
```

- [ ] **Étape 1 : test qui échoue** (`tests/quote-validation.test.ts`, ajout) : `validateQuoteInput({ source: "liste-devis", message: "…Ville : Agadir", items: [{ slug: "a", name: "A", quantity: 2 }] })` → `ok: true`, `items` conservés, `source: "liste-devis"`. Si le test passe tout de suite, ne pas modifier la validation.
- [ ] **Étape 2 : `AddToQuoteButton`.**
  - Au clic : `quoteList.add`, puis le texte passe à « Ajouté ✓ » pendant 1,5 s.
  - Le compteur du header rebondit (classe CSS en transform, retirée sur `animationend`).
  - Tout est désactivé avec `prefers-reduced-motion: reduce`.
- [ ] **Étape 3 : `QuoteDrawer`.**
  - Dialog plein écran sur mobile, latéral à partir de `md`.
  - Lignes avec − / + / « Retirer » ; champs Nom et Ville (facultatifs, `maxLength` 120).
  - **Bouton « Envoyer sur WhatsApp »**, dans le même geste :
    1. construire le message (`quoteListMessage`) ;
    2. `window.open(whatsappLink(...))` ;
    3. `void saveQuoteRequest({ source: "liste-devis", name, message, items })` ;
    4. `quoteList.clear()`.
  - Liste vide : « Votre liste est vide » et un lien vers `/produits`.
  - Synchroniser les onglets : `window.addEventListener("storage", quoteList.syncFromStorage)`.
- [ ] **Étape 4 : brancher** le compteur dans le header, le tiroir dans `app/layout.tsx` (un seul exemplaire, numéro issu des réglages) et le bouton « Ma liste » dans `MobileCta`.
- [ ] **Étape 5 :** `npm test`, lint, tsc → SUCCÈS. **Commit** `feat(devis): liste de devis multi-produits avec tiroir et envoi WhatsApp`.

### Task 5: requête du catalogue (filtrage pur)

**Fichiers :**
- Créer : `lib/catalog-query.ts`, `tests/catalog-query.test.ts`

**Interfaces produites :**
```ts
export type CatalogSort = "featured" | "name" | "category";
export type CatalogQuery = { q: string; gamme: string | null; dispo: string | null; tri: CatalogSort };
export function parseCatalogQuery(params: Record<string, string | string[] | undefined>, known: { categories: string[]; stocks: string[] }): CatalogQuery;
export function stockOptions(products: { stock: string }[]): { value: string; label: string; count: number }[]; // valeur = clé normalisée (sans casse ni accents)
export function queryCatalog<T extends { name: string; slug: string; category: string; categoryLabel: string; stock: string; featured?: boolean; specs: { label: string; value: string }[] }>(products: T[], query: CatalogQuery): T[];
export function catalogHref(query: Partial<CatalogQuery>): string; // « /produits?... », sans les valeurs par défaut
```

- [ ] **Étape 1 : tests qui échouent :**
  - `q: "pompe immergee"` trouve « Pompe immergée inox 4" » (accents ignorés), et la recherche couvre aussi le nom de gamme et les valeurs des caractéristiques ;
  - `gamme` inconnue → `null` ;
  - `tri: "<script>"` → `"featured"` ;
  - `q` de 5 000 caractères → tronqué à 80 ;
  - tableaux de valeurs (`?gamme=a&gamme=b`) → la première valeur connue ;
  - `stockOptions` sur « Disponible », « disponible », « Sur demande » → 2 options, avec les bons comptes ;
  - `dispo` filtre par clé normalisée ;
  - le tri `featured` place les produits mis en avant d'abord et garde l'ordre d'origine ensuite (tri stable) ;
  - `catalogHref({ gamme: "pompes" })` === `/produits?gamme=pompes`, et `catalogHref({})` === `/produits`.
- [ ] **Étape 2 :** `node --test tests/catalog-query.test.ts` → ÉCHEC.
- [ ] **Étape 3 : implémenter.** Réutiliser la normalisation sans accents de `lib/admin/product-filters.ts` en l'extrayant dans `lib/normalize.ts`, et mettre l'admin à jour pour l'importer.
- [ ] **Étape 4 :** `npm test` → SUCCÈS. **Commit** `feat(catalogue): filtrage et tri du catalogue par l'URL (module pur testé)`.

### Task 6: carte produit serveur

**Fichiers :**
- Modifier : `components/product-card.tsx` (devient un composant serveur)
- Créer : `components/product-card-image.tsx` uniquement si un état client est nécessaire. Préférer le CSS `group-hover`.

**Interfaces :**
- Consomme : `AddToQuoteButton` (tâche 4), `WhatsAppLink` (tâche 2), `productMessage`, `whatsappLink` (tâche 1).
- Produit : `ProductCard(props: { product: Product; sizes: string; whatsappNumber: string; siteUrl: string })`.

- [ ] **Étape 1 : rendu de la carte.**
  - Image : `next/image` `fill`, conteneur `aspect-square`, `placeholder="blur"` si `imageBlurDataURL` existe, `sizes` fourni par l'appelant.
  - Si `gallery[0]` existe : seconde image superposée, `opacity-0 group-hover:opacity-100`, `loading="lazy"`.
  - Contenu : badge, nom (lien vers la fiche), les 3 premières caractéristiques, gamme, `AddToQuoteButton`, `WhatsAppLink` avec la source `carte-produit`.
  - Survol : `hover:-translate-y-0.5`, ombre, image `group-hover:scale-105` (transform uniquement). Pression : `active:scale-[0.98]`.
  - Valeurs de `sizes` :
    - grille catalogue : `(min-width:1280px) 280px, (min-width:768px) 33vw, 50vw` ;
    - carrousel : `(min-width:768px) 280px, 72vw`.
- [ ] **Étape 2 :** `npx tsc --noEmit -p .` et `npm run lint` → SUCCÈS. Vérification visuelle à la tâche 10. **Commit** `feat(ui): carte produit rendue par le serveur, survol et pression`.

### Task 7: page catalogue

**Fichiers :**
- Modifier : `app/produits/page.tsx`, `components/site-header.tsx` (la recherche du header navigue vers `/produits?q=`)
- Créer :
  - `components/catalog/filter-chips.tsx` (serveur, liens) ;
  - `components/catalog/filters-sheet.tsx` (client, Dialog) ;
  - `components/catalog/catalog-grid-skeleton.tsx`.
- Supprimer : `components/catalog-browser.tsx`, `components/quick-view.tsx`, `lib/catalog-filters.ts`

**Interfaces :**
- Consomme : `parseCatalogQuery`, `queryCatalog`, `stockOptions`, `catalogHref` (tâche 5) ; `ProductCard` (tâche 6).

- [ ] **Étape 1 : page.** Le hero existant est gardé. Le compteur affiche le nombre réel de références. La section de réassurance devient : « Livraison partout au Maroc », « Conseil technique », « Devis sous 24 h ». **« Garantie constructeur » est retiré.**
- [ ] **Étape 2 : résultats.** Dans `<Suspense fallback={<CatalogGridSkeleton/>}>`, `searchParams.then(...)` lit la requête, puis :
  - chips de gamme défilables (`overflow-x-auto snap-x`, liens `catalogHref`) ;
  - formulaire GET de recherche ;
  - bouton « Filtres » sur mobile, qui ouvre le panneau : disponibilité et tri, en formulaire GET ;
  - barre visible à partir de `md` ;
  - grille de 2, 3 puis 4 colonnes ;
  - état vide avec un lien « Effacer les filtres ».
- [ ] **Étape 3 : supprimer** les fichiers listés et vérifier qu'aucun import ne reste (`grep -rn "catalog-browser\|quick-view\|catalog-filters" app components lib`, sortie vide).
- [ ] **Étape 4 :** lint, tsc, tests, `npm run build` → SUCCÈS. **Commit** `feat(catalogue): filtres dans l'URL, chips mobiles et panneau de filtres`.

### Task 8: page d'accueil en sections serveur

**Fichiers :**
- Créer dans `components/home/` : `hero.tsx`, `reassurance.tsx`, `category-cards.tsx`, `featured-carousel.tsx`, `how-it-works.tsx`, `showcase.tsx`, `faq.tsx`, `final-cta.tsx`, `testimonials.tsx` (exporte un composant qui renvoie `null` tant que `TESTIMONIALS` est vide).
- Modifier : `app/page.tsx`
- Supprimer : `components/home-page.tsx`. Retirer aussi de `lib/catalog.ts` les ré-exports WhatsApp devenus inutiles (tâche 1).

**Interfaces :**
- Consomme : `getCatalog()`, `getSiteSettings()`, `AMBIANCE_IMAGES` (`lib/ambiance-images.ts`), `ProductCard`, `WhatsAppLink`, `AddToQuoteButton`.

- [ ] **Étape 1 : hero.**
  - `<picture>` avec `<source media="(min-width:768px)">` pour `hero/home.webp` (16:9) ; `hero/home-mobile.webp` (4:5) est l'`<img>` de base. Ou bien `getImageProps` de `next/image` : lire `node_modules/next/dist/docs` sur l'art direction.
  - `fetchPriority="high"`, sans lazy. Hauteur `min-h-[100svh]`, dégradé, titre display, slogan de la marque.
  - CTA `WhatsAppLink` (source `accueil-hero`) et lien « Voir le catalogue ».
- [ ] **Étape 2 : sections, dans l'ordre de la spec.**
  - **Réassurance** : les 3 faits.
  - **Catégories** : image admin, sinon image du premier produit mis en avant de la gamme, sinon du premier produit ; nombre de références ; lien `catalogHref({ gamme })`.
  - **Carrousel** : `overflow-x-auto snap-x snap-mandatory`, produits `featured`, sans JavaScript.
  - **Comment ça marche** : 3 étapes.
  - **Mise en situation** : image `sections/*.webp` lazy, avec `{products.length} références`, `{categories.length} gammes`, « Devis gratuit ».
  - **FAQ** en `<details>` : 5 questions — comment demander un devis, est-ce payant (non, devis gratuit), livrez-vous partout au Maroc, pouvez-vous me conseiller pour choisir ma pompe, comment envoyer plusieurs produits (la liste de devis).
  - **CTA final** : `WhatsAppLink`, source `accueil-cta`.
  - **Témoignages** : non rendus.
- [ ] **Étape 3 : `app/page.tsx`** compose les sections, avec header et pied de page. Vérifier qu'aucun fichier de `components/home/` ne commence par `"use client"`, sauf si c'est indispensable.
- [ ] **Étape 4 :** lint, tsc, tests, build → SUCCÈS. **Commit** `feat(accueil): page d'accueil en sections serveur (hero, catégories, carrousel, FAQ)`.

### Task 9: fiche produit

**Fichiers :**
- Modifier : `app/produits/[slug]/page.tsx`, `components/product-quote.tsx`
- Créer :
  - `components/product/gallery.tsx` (client) ;
  - `components/product/specs-table.tsx` (serveur) ;
  - `components/product/sticky-bar.tsx` (client, mobile).

**Interfaces :**
- Consomme : `getProductBySlug`, `getRelatedProducts`, `ProductCard`, `AddToQuoteButton`, `WhatsAppLink`, `productMessage`.
- Produit : `Gallery(props: { images: { src: string; alt: string; blurDataURL?: string }[] })`.

- [ ] **Étape 1 : galerie.**
  - Piste `snap-x` en `aspect-square`, avec points et miniatures (boutons) qui font défiler jusqu'à l'image.
  - Bouton « Agrandir » : Dialog plein écran, image `object-contain`, zoom ×2 au toucher ou au clic sur l'image (transform-origin au point touché), fermeture par Échap.
  - Première image `priority`, `sizes="(min-width:1024px) 50vw, 100vw"`.
- [ ] **Étape 2 : contenu.**
  - Tableau des caractéristiques (`<table>` avec `<th scope="row">`), disponibilité, description.
  - `ProductQuote` : quantité, `AddToQuoteButton` avec cette quantité, et `WhatsAppLink` (source `fiche-produit`) qui envoie ce produit seul.
  - Produits associés : `ProductCard` en grille.
- [ ] **Étape 3 : barre collante mobile** (`md:hidden fixed bottom-0`, `pb-[env(safe-area-inset-bottom)]`) : « Ajouter au devis » et WhatsApp (source `barre-mobile`). `MobileCta` n'est pas rendu sur cette page.
- [ ] **Étape 4 :** lint, tsc, tests, build → SUCCÈS. **Commit** `feat(fiche): galerie à balayer avec zoom, caractéristiques et barre WhatsApp collante`.

### Task 10: vérification, captures, Lighthouse, PR

**Fichiers :**
- Créer : `docs/prs/phase-4-vitrine.md`, `docs/screenshots/4-vitrine/*`

- [ ] **Étape 1 :** `npm run lint`, `npm test`, `npx tsc --noEmit -p .`, `npm run build` → tous au vert.
- [ ] **Étape 2 : E2E local** (Playwright, script hors dépôt, `next start` en production) :
  - ajout depuis une carte et depuis la fiche → compteur à 2 ;
  - tiroir : quantité + puis −, nom et ville, envoi → la fenêtre `wa.me` s'ouvre avec les 2 produits ;
  - une ligne `quote_requests` (`source = liste-devis`, 2 `items`) existe → la supprimer ensuite avec le compte admin de test ;
  - clic WhatsApp du hero → une ligne `accueil-hero`, supprimée ensuite ;
  - `/produits?gamme=pompes&dispo=…` filtre bien, et `?gamme=inconnue` affiche tout ;
  - aucune erreur JavaScript.
- [ ] **Étape 3 : captures** avec `node scripts/screenshots.mjs 4-vitrine <url…>` : `/`, `/produits`, `/produits?gamme=pompes`, une fiche, et le tiroir ouvert (via le script E2E), en 390×844 et 1440×900.
- [ ] **Étape 4 : Lighthouse mobile** (`npx lighthouse <url> --form-factor=mobile --quiet --output=json`, si disponible sans installation globale ; sinon Chrome DevTools) sur `/`, `/produits` et une fiche. Noter les 4 scores, le LCP et le CLS. Si un score est sous 95 : corriger (systematic-debugging) avant la PR.
- [ ] **Étape 5 : description de PR.** Objectif, changements, captures, checklist, « aucune dépendance, aucune migration », mesures Lighthouse.
- [ ] **Étape 6 :** revue de code de la branche (requesting-code-review), corrections, puis `git push -u origin feat/vitrine-mobile` et lien de comparaison.
