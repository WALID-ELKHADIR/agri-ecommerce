# Animations et micro-interactions : plan d'implémentation

> **Pour les agents :** sous-skill OBLIGATOIRE : superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour exécuter ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**But :** rendre la vitrine vivante sans la ralentir.
- Apparitions au défilement, compteurs, parallaxe.
- Cartes inclinables.
- Transition catalogue → fiche.
- Header compact et menu en tiroir.
- Pulsation WhatsApp, vol vers « Ma liste » et toast.
- Tracé du logo.

**Architecture :**
- Le CSS d'abord : timelines `view()` et `scroll()` sous `@supports`.
- Un seul composant client global, `Motion`, pour les replis et les effets qui demandent du JavaScript. Les éléments sont marqués par des attributs `data-*`, et aucun élément n'a son propre composant client.
- `<ViewTransition>` natif de React pour le morph carte → fiche.

**Stack :** Next.js 16.4, React 19.3, Tailwind 4, `node --test`, Playwright.

**Spec :** `docs/superpowers/specs/2026-11-21-animations-ui-design.md`

## Contraintes globales
- Animer uniquement `transform` et `opacity`. Seule exception : le contenu texte des compteurs.
- Tout est désactivé avec `prefers-reduced-motion: reduce`, en CSS et en JavaScript (`matchMedia`).
- Rien ne cache un élément visible au chargement. Sans JavaScript, tout est visible.
- Aucune dépendance. Aucun composant client par carte ou par élément.
- Cascade : 70 ms par rang (`--i`). Inclinaison : 4° au plus. Pulsation : cycle de 8 s, active 600 ms. Morph : 380 ms. Toast : 3 s. Compteur : 800 ms.
- Titre du hero toujours visible (décision du propriétaire).
- Commits en Conventional Commits français, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Lint, tsc et tests au vert avant chaque commit.

## Points de vigilance (Review Focus)
1. **Page ouverte au milieu** (rechargement après défilement, lien avec ancre `/#faq`) : les éléments visibles ne doivent pas être cachés ni rejouer leur apparition. → test E2E dans la tâche 7 : ouvrir `/#faq`, la FAQ est visible immédiatement.
2. **Préférence « réduire les animations »** : aucun élément caché, aucun vol, compteur à sa valeur finale. → test E2E dans la tâche 7 avec `reducedMotion: "reduce"`.
3. **Écran tactile** : aucune inclinaison, aucun écouteur de `pointermove` actif. → test unitaire dans la tâche 1 (`canTilt`).
4. **Ajout au devis alors que l'icône « Ma liste » est invisible** (menu ouvert, desktop sans barre mobile) : le vol est sauté, le toast s'affiche quand même. → test unitaire dans la tâche 1 (`flightPath` renvoie `null`).
5. **Navigateur sans View Transitions ni timelines de défilement** : la navigation et le contenu fonctionnent normalement. → vérifié dans la tâche 7 via le repli (`data-revealed`) ; le morph est sans effet.

---

### Task 1: fonctions de mouvement pures

**Fichiers :**
- Créer : `lib/motion.ts`, `tests/motion.test.ts`

**Interfaces produites :**
```ts
export const TILT_MAX_DEG = 4;
export const COUNT_MS = 800;
export function tiltFromPointer(rect: { left: number; top: number; width: number; height: number }, x: number, y: number): { rx: number; ry: number };
export function canTilt(media: { hover: boolean; finePointer: boolean; reducedMotion: boolean }): boolean;
export function countValue(target: number, elapsedMs: number): number;      // entier, ease-out, = target à COUNT_MS
export function shouldHideForReveal(top: number, viewportHeight: number): boolean; // true seulement si sous la flottaison
export function flightPath(from: { x: number; y: number } | null, to: { x: number; y: number; visible: boolean } | null): { dx: number; dy: number } | null;
```

- [ ] **Étape 1 : tests qui échouent :**
  - **`tiltFromPointer`** : le centre donne `{ rx: 0, ry: 0 }`. Le coin haut-gauche donne `{ rx: 4, ry: -4 }` : le haut penche vers l'arrière, la gauche vers la gauche. Hors du cadre, les valeurs sont bornées à ±4.
  - **`canTilt`** : `false` dès que `hover` ou `finePointer` vaut `false`, ou que `reducedMotion` vaut `true`.
  - **`countValue`** :
    - `countValue(25, 0) === 0`, `countValue(25, 800) === 25`, `countValue(25, 5000) === 25` ;
    - suite croissante, toujours un entier ;
    - `countValue(25, 400) > 12`, car la courbe ralentit en fin de course.
  - **`shouldHideForReveal`** : `(100, 800) === false`, `(799, 800) === false`, `(820, 800) === true`.
  - **`flightPath`** :
    - `flightPath({x:10,y:500}, {x:300,y:20,visible:true})` donne `{ dx: 290, dy: -480 }` ;
    - cible invisible ou `null`, ou départ `null` : `null`.
- [ ] **Étape 2 :** `node --test tests/motion.test.ts` → ÉCHEC (module introuvable).
- [ ] **Étape 3 : implémenter.** Courbe ease-out cubique : `1 - (1 - t)^3`.
- [ ] **Étape 4 :** `npm test` → SUCCÈS. **Commit** `feat(animations): fonctions de mouvement pures et testées`.

### Task 2: fondations CSS

**Fichiers :**
- Modifier : `app/globals.css`

**Produit** (classes et attributs que les tâches suivantes posent) :
- `[data-reveal]` (cascade via `--i`), `[data-revealed]`, `html.motion-js` ;
- `.parallax` ;
- `.wa-pulse` ;
- `.site-topbar`, `.site-header-shell` ;
- `[data-tilt]` ;
- `.quote-flight` ;
- `::view-transition-group(.morph)`.

- [ ] **Étape 1 : apparitions.**
  - Dans `@supports (animation-timeline: view())`, avec `prefers-reduced-motion: no-preference` : `[data-reveal]` joue un keyframe `reveal-in` (opacité 0 → 1, `translateY(16px)` → 0) sur `animation-timeline: view()` et `animation-range: entry 0% entry 60%`, avec `animation-delay: calc(var(--i, 0) * 70ms)`.
  - Repli sans `@supports` : `html.motion-js [data-reveal][data-hidden]` vaut `opacity: 0; transform: translateY(16px)`. `[data-revealed]` passe à 1 et 0 avec une transition de 500 ms et `transition-delay: calc(var(--i,0) * 70ms)`.
- [ ] **Étape 2 :**
  - **`.parallax`** : `translateY` de -6 % à 6 %, sur `view()`, seulement avec `(min-width:1024px)`.
  - **`.wa-pulse`** : anneau `::after`, keyframes sur 8 s (scale 1 → 1,6, opacité 0,5 → 0 entre 0 % et 7,5 %, puis repos), `infinite`.
  - **Header** : `.site-topbar` glisse et disparaît sur `animation-timeline: scroll(root)` et `animation-range: 0 80px`. Repli : `html[data-scrolled] .site-topbar`.
  - **`[data-tilt]`** : `transform: perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))`, transition de 150 ms. Ombre teintée au survol : `shadow-field-900/15`.
  - **Morph** : `::view-transition-group(.morph) { animation-duration: 380ms }`.
  - **Tout** est neutralisé dans `@media (prefers-reduced-motion: reduce)`.
- [ ] **Étape 3 :** `npm run lint`, `npm run build` → SUCCÈS. Aucun élément n'est encore marqué, donc rien ne change à l'écran. **Commit** `feat(animations): fondations CSS (apparitions, parallaxe, pulsation, header, morph)`.

### Task 3: composant global `Motion`

**Fichiers :**
- Créer : `components/motion.tsx` (client), `lib/hooks/use-reveal.ts`
- Modifier : `app/layout.tsx` (monté à côté de `ClickTracker`)

**Interfaces :**
- Consomme : `canTilt`, `tiltFromPointer`, `countValue`, `shouldHideForReveal` (tâche 1).
- Produit : `useReveal(): void` (un seul `IntersectionObserver` sur `[data-reveal]`) et `Motion(): null`.

- [ ] **Étape 1 : `useReveal`.**
  - Quitter immédiatement si `CSS.supports("animation-timeline: view()")` est vrai ou si le mouvement est réduit.
  - Sinon : ajouter la classe `motion-js` à `<html>`. Pour chaque `[data-reveal]` dont `shouldHideForReveal(top, innerHeight)` est vrai, poser `data-hidden`. Observer, puis poser `data-revealed` et retirer `data-hidden` à l'entrée.
  - Rescanner après chaque navigation : écouter `usePathname`.
- [ ] **Étape 2 : `Motion`.**
  - **Compteurs** : observer `[data-count-to]`. À l'entrée, animer le `textContent` avec `countValue` (rAF). Sauter avec un mouvement réduit.
  - **Inclinaison** : un écouteur `pointermove` sur `document`, seulement si `canTilt(...)`. Cible : `closest("[data-tilt]")`. Pose `--rx` et `--ry` via rAF, remet à 0 au `pointerout`.
  - **Header** : si `CSS.supports("animation-timeline: scroll()")` est faux, écouteur `scroll` passif qui pose ou retire `data-scrolled` sur `<html>` au-delà de 40 px.
  - **Logo** : si `sessionStorage["saqia:logo-vu"]` existe, retirer la classe `saqia-logo-animated`. Sinon, l'écrire (try/catch).
- [ ] **Étape 3 :** lint, tsc, tests → SUCCÈS. **Commit** `feat(animations): composant global Motion (apparitions, compteurs, inclinaison, header, logo)`.

### Task 4: marquage des pages

**Fichiers :**
- Modifier :
  - `components/home/sections.tsx`, `components/home/hero.tsx` ;
  - `components/product-card.tsx` ;
  - `app/produits/page.tsx`, `app/produits/[slug]/page.tsx` ;
  - `components/mobile-cta.tsx`, `components/site-header.tsx`.

- [ ] **Étape 1 : marquage.**
  - **`data-reveal`** sur les titres et contenus de section : engagements, gammes, sélection, étapes, mise en situation, FAQ, CTA final, produits associés.
  - **Cascade** : sur chaque `<li>` des grilles (gammes, étapes, cartes du catalogue au-delà de la 4ᵉ), `style={{ "--i": index % 8 } as CSSProperties}`.
  - **Exclus** : le hero et la première rangée du catalogue (visibles au chargement).
- [ ] **Étape 2 :** `data-count-to={productCount}` et `data-count-to={rangeCount}` sur les chiffres de la mise en situation (« 0 DH » reste fixe). Classe `.parallax` sur l'image de la mise en situation et sur les images des cartes de gammes.
- [ ] **Étape 3 :** `data-tilt` sur l'`<article>` de `ProductCard`. Classe `.wa-pulse` sur le WhatsApp de `MobileCta` et du header. Classes `.site-topbar` et `.site-header-shell` sur le header. `<Logo animated />` dans le header quand `pathname === "/"`.
- [ ] **Étape 4 :** lint, tsc, tests, build → SUCCÈS. **Commit** `feat(animations): apparitions, compteurs, parallaxe et pulsation sur la vitrine`.

### Task 5: transition carte → fiche

**Fichiers :**
- Modifier : `components/product-card.tsx`, `components/product/gallery.tsx`

- [ ] **Étape 1 : envelopper les images.**
  - Dans la carte : l'`<Image>` principale.
  - Dans la galerie : la première image.
  - Les deux avec `<ViewTransition name={\`produit-${slug}\`} share="morph" default="none">` (import `ViewTransition` depuis `react`).
  - `Gallery` reçoit une nouvelle prop `slug: string`.
- [ ] **Étape 2 :** lint, tsc, build → SUCCÈS. Vérification manuelle dans Chrome : un clic sur une carte fait glisser l'image jusqu'à la fiche. Le contrôle automatique se fait à la tâche 7 (aucune erreur, page affichée). **Commit** `feat(animations): l'image de la carte se transforme en image de la fiche`.

### Task 6: menu mobile en tiroir, vol vers « Ma liste » et toast

**Fichiers :**
- Modifier : `components/site-header.tsx`, `components/click-tracker.tsx`, `components/quote-list/quote-counter.tsx`, `components/quote-list/mobile-quote-button.tsx`
- Créer : `components/quote-list/quote-toast.tsx` (client, monté par `ClickTracker`)

**Interfaces :**
- Consomme : `flightPath` (tâche 1), `openQuoteDrawer`, `onQuoteAdded` (existants).
- Produit : l'attribut `data-quote-target` sur l'icône du header et sur le bouton « Ma liste » de la barre mobile ; l'événement `saqia:ajout-devis` porte désormais `detail: { name: string; from: { x: number; y: number } }`.

- [ ] **Étape 1 :** le panneau `{open ? <div id="mobile-menu">…` du header est remplacé par `<Sheet side="right" title="Menu">`. Les liens et la recherche ferment le tiroir.
- [ ] **Étape 2 : vol.**
  - `ClickTracker` calcule `from` au centre du bouton cliqué. La cible est le premier `[data-quote-target]` visible (`offsetParent !== null`).
  - Si `flightPath` n'est pas `null` et que le mouvement n'est pas réduit : créer `<span class="quote-flight">` en `position: fixed`, l'animer avec `animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: \`translate(${dx}px,${dy}px) scale(.4)\`, opacity: 0.2 }], { duration: 550, easing: "cubic-bezier(.2,.7,.3,1)" })`, puis la retirer.
- [ ] **Étape 3 : `QuoteToast`.**
  - Écoute `saqia:ajout-devis`. Affiche « {name} ajouté à votre liste » dans `role="status"`, avec un bouton « Voir la liste » (`openQuoteDrawer`).
  - Disparaît après 3 s, en fondu sur l'opacité.
  - Placé au-dessus de la barre mobile (`bottom-24` sur mobile, `bottom-6` sur ordinateur).
- [ ] **Étape 4 :** lint, tsc, tests, build → SUCCÈS. **Commit** `feat(animations): menu mobile en tiroir, vol vers « Ma liste » et toast d'ajout`.

### Task 7: vérification, vidéo, Lighthouse, PR

**Fichiers :**
- Créer : `docs/prs/phase-4bis-animations.md`, `docs/screenshots/4bis-animations/*` (captures et `animations.webm`)

- [ ] **Étape 1 :** lint, tests, tsc, build → au vert. Puis l'E2E de la phase 4 (scratchpad `e2e-vitrine.mjs`) repasse entièrement.
- [ ] **Étape 2 : E2E animations** (Playwright, serveur de production sur :3107) :
  - à l'ouverture de `/`, la section « Questions fréquentes » (sous la flottaison) a une opacité calculée < 1 sans timeline, ou une animation `view()` avec timeline ; après `scrollIntoView` et 800 ms, opacité 1 ;
  - `/#faq` : opacité 1 immédiatement ;
  - avec `reducedMotion: "reduce"` : aucun `[data-hidden]`, et le compteur affiche « 25 » sans changer ;
  - ajout au devis depuis le catalogue : un `.quote-flight` apparaît puis disparaît, et le toast « ajouté à votre liste » est visible ;
  - menu mobile : le tiroir s'ouvre et se ferme ;
  - aucune erreur JavaScript.
- [ ] **Étape 3 : vidéo et captures.**
  - Vidéo Playwright (`recordVideo`, mobile 390×844) : défilement de l'accueil, ajout au devis, ouverture d'une fiche. Copier en `docs/screenshots/4bis-animations/animations.webm`.
  - Captures 390×844 et 1440×900 de l'accueil.
- [ ] **Étape 4 : Lighthouse** (`lh-run.sh`, 2 passes sur `/` et `/produits`) : comparer le TBT et le LCP à la phase 4. Une régression nette (TBT +300 ms en moyenne) doit être corrigée avant la PR.
- [ ] **Étape 5 :**
  - revue de code de toute la branche, puis corrections ;
  - description de la PR, en indiquant que la branche part de `feat/vitrine-mobile` ;
  - `git push -u origin feat/animations-ui` et lien de comparaison.
