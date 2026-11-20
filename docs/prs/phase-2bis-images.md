# feat: Phase 2bis — images produits issues du stock réel

## Objectif
Remplacer les anciennes images, minuscules ou absentes, par les photos de votre stock réel, sans jamais montrer le fournisseur. Ajouter au catalogue les produits visibles sur ces photos.

## Changements
- **Originaux préservés** : les 38 photos sont dans `public/images/_archive/2026-11-photos-fournisseur/` (`photo-01` à `photo-38`, table des noms d'origine). Rien n'est supprimé.
- **35 images du site** dans `public/images/products/<slug>/`
  - `main.webp` = produit détouré sur le fond crème de la marque, avec une ombre douce ;
  - `gallery-N.webp` = mises en situation recadrées.
  - Toutes font 1200 × 1200 et pèsent **moins de 150 Ko** (11 à 136 Ko).
- **Aucune trace du fournisseur**
  - Ses scènes ne servent qu'à des photos détourées.
  - Sur une photo, le logo était trop proche du produit : sa zone est effacée avant le détourage.
  - Planche de contrôle : `docs/images-contact-sheet.png`.
- **Pipeline reproductible** (`scripts/images/`)
  - `sources.ts` : décisions photo par photo.
  - `process-images.ts` : détourage local et gratuit, WebP, aperçu flou, couleur dominante, manifest typé `lib/images-manifest.ts`.
  - `contact-sheet.ts` : planche de contrôle.
  - `check-images.ts` : avertit au build.
  - `sync-images.ts` : envoi vers Supabase Storage, en simulation par défaut.
- **Catalogue**
  - **3 nouvelles catégories** : Accessoires de pompage, Arrosage & goutte-à-goutte, Motoculture & outillage.
  - **14 nouveaux produits**, sans caractéristiques inventées (« Sur demande », à compléter dans l'admin).
  - **Choix de l'image** : une image choisie dans l'admin reste prioritaire.
- **Migration** `20261120100000_catalogue_images.sql`
  - Ajoute catégories et produits.
  - Remplace uniquement les anciens chemins `.jpg`, et les textes alternatifs encore d'origine.
- **Tests (54)**
  - Choix des images, y compris les cas après migration et après envoi vers Storage.
  - Migration rejouée deux fois sur un vrai Postgres, en vérifiant qu'aucune modification faite dans l'admin n'est écrasée.
  - Chaque produit a ses images.

## À faire par vous
1. **Appliquer la migration** `supabase/migrations/20261120100000_catalogue_images.sql` (*SQL Editor → Run*).
2. **Valider la planche contact** `docs/images-contact-sheet.png` : aucune trace de Moyza, et chaque photo correspond au bon produit.
3. **Confirmer 3 correspondances**, signalées aussi à chaque build :
   - pompes à brides n° 8 et 9 pour la pompe fonte ;
   - n° 10 et 13 pour la haute pression ;
   - les deux fiches de coude PE.
4. **Fournir des photos**, idéalement sur fond uni, pour :
   - la pompe immergée inox 4", la motopompe inox et le coude PE fileté, qui ont une image provisoire ;
   - l'asperseur orange et la colle PVC, qui sont recadrés faute de détourage propre.
5. **Compléter les caractéristiques** des 14 nouveaux produits (dans l'admin, en phase 3).

## Captures
`docs/screenshots/2bis-images/` : accueil, catalogue (25 produits, 7 catégories), coude PE et asperseur à impact.

## Checklist
- [x] `npm run lint`
- [x] `npm test` (56/56)
- [x] `npx tsc --noEmit`
- [x] `npm run build`, avec l'avertissement `check-images` attendu
- [x] Revue de code. Corrections appliquées :
  - **Aperçu flou et statut provisoire :** ils étaient perdus une fois la migration appliquée.
  - **`next/image` :** configuration pour Supabase Storage.
  - **Envoi Storage :** versionné par empreinte, sans les images provisoires.
  - **Migration :** elle respecte les textes alternatifs modifiés.
  - **Débroussailleuse :** rectangle blanc résiduel supprimé.
- [x] Photos d'ambiance : 5 photos Unsplash validées par vous, crédits archivés
- [ ] Lighthouse : à partir de la phase 4

## Dépendances ajoutées
Aucune. L'outil de détourage (`@imgly/background-removal-node`, environ 360 Mo) s'installe à part, uniquement pour régénérer les images. Il n'est pas livré avec le site (voir l'en-tête de `process-images.ts`).

## Photos d'ambiance
- Les 5 photos Unsplash que vous avez validées (licence Unsplash, usage commercial gratuit) sont archivées dans `public/images/_archive/2026-11-stock-unsplash/`, avec l'auteur et la source de chacune.
- Elles donnent 6 images, générées par `scripts/images/process-ambiance.ts` :
  - `hero/home.webp` (16:9) et `hero/home-mobile.webp` (4:5, cadrage manuel) ;
  - `sections/goutte-a-goutte`, `vergers` et `serres` ;
  - `categories/arrosage`.
  - Toutes pèsent moins de 200 Ko, et leur manifest est `lib/ambiance-images.ts`.
- Elles seront intégrées aux pages lors de la refonte de la vitrine (Phase 4), et sont à remplacer par vos photos de terrain.

## Pas encore fait
- **Affichage soigné :** aperçu flou, cadrage et galerie avec swipe arrivent avec la refonte de la vitrine (Phase 4).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
