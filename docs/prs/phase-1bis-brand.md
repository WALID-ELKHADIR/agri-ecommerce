# feat: Phase 1bis — marque et logo Saqia

> ⚠️ **Branche empilée** sur `fix/securite-admin-rls`, elle-même sur `chore/assainissement`. Aucune des deux n'est encore fusionnée dans `main`. Fusionnez les PR dans l'ordre : Phase 0, Phase 1, puis celle-ci.

## Objectif
Remplacer AgriFlow par **Saqia** (ساقية, la rigole qui amène l'eau aux cultures) et livrer une identité complète : logo, déclinaisons, icônes et charte.

## Changements
- **Renommage**
  - AgriFlow devient Saqia partout : titres, métadonnées, header, footer, admin, messages WhatsApp, README, `package.json`.
  - Slogan « L'eau au bon endroit. » et sous-titre « Pompes & irrigation — devis sur WhatsApp ».
  - Repli `contact@saqia.com` et `https://saqia.com`. `metadataBase` lit `NEXT_PUBLIC_SITE_URL`.
- **Police de marque** : Bricolage Grotesque via `next/font` (classe `font-display`).
- **Logo « Parcelle »** (piste C, choisie par vous)
  - `lib/brand/logo-svg.ts` est la source unique de la géométrie.
  - Les wordmarks « saqia » et ساقية sont vectorisés (fontTools + HarfBuzz, via `scripts/brand/wordmarks.py`).
  - Composant `components/brand/logo.tsx` :
    - variantes `full` / `symbol` / `wordmark` ;
    - tons `color` / `mono` / `inverse` ;
    - `fr` / `ar` ;
    - version renforcée `small` pour 32 px et moins ;
    - tracé animé du canal (`animated`), désactivé si l'utilisateur préfère réduire les animations.
  - L'ancien `components/logo.tsx` est supprimé. Le header, le footer, l'admin et la connexion utilisent le nouveau logo.
- **Fichiers générés** par `node scripts/brand/build-assets.ts` :
  - `public/brand/` : SVG couleur, mono, inversé et arabe, logo PNG 1024 px, avatars WhatsApp 640 px clair et foncé ;
  - `public/icons/` : icônes PWA 192, 512 et maskable ;
  - `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico` (16/32/48).
- **Image de partage** `app/opengraph-image.tsx` : logo, slogan et symbole agrandi. La police est embarquée dans `assets/fonts` (licence OFL).
- **Charte `docs/brand.md`** :
  - sens du nom et ton de voix ;
  - règles du logo : zone de protection, tailles minimales, interdits ;
  - palette avec contrastes WCAG vérifiés et typographie ;
  - exemples de messages WhatsApp en français et en darija.
- **Page interne `/brand`** (noindex) : logo final et toutes ses déclinaisons.

## Captures
`docs/screenshots/1bis-brand/` : `/brand`, accueil, contact et connexion admin, en mobile et desktop, plus l'image de partage (`opengraph-image.png`).

## Checklist
- [x] `npm run lint`
- [x] `npm test` (35/35)
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] Plus aucun « AgriFlow », sauf le commentaire de la migration init, qu'on ne modifie jamais, et les documents de suivi
- [x] Revue de code. Corrections appliquées :
  - SVG statiques allégés ;
  - mono en `currentColor` côté React ;
  - titre SVG échappé ;
  - canal découpé selon les coins ;
  - doc alignée sur le code.
- [ ] Lighthouse : à partir de la phase 4

## Dépendances ajoutées
Aucune dépendance npm. Les scripts de marque utilisent `sharp`, déjà présent via Next. La vectorisation des wordmarks est un outil Python ponctuel (fontTools, uharfbuzz), installé hors du projet.

## Migrations SQL
Aucune.

## À vérifier par vous
- **Darija :** l'exemple de réponse dans `docs/brand.md` est à relire par une personne qui la parle au quotidien.
- **Reste du site :** il garde sa palette bleu marine jusqu'au design system de la Phase 2. Seul le logo change ici.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
