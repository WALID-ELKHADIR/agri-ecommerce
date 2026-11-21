# feat: carrousel d'accueil, gaine goutte-à-goutte et bouton AR | FR

## Objectif
- Transformer le hero de l'accueil en carrousel de 3 diapositives.
- Ajouter le tuyau goutte-à-goutte au catalogue.
- Proposer le site en arabe (en-tête, menus, carrousel), avec la lecture de droite à gauche.

## Changements
- **Carrousel de 3 diapositives** :
  1. le goutte-à-goutte (photo actuelle) ;
  2. le pompage agricole (sans « solaire » : aucune pompe solaire au catalogue) ;
  3. les serres et réseaux sous pression.

  Fonctionnement :
  - défilement automatique toutes les 5 s, flèches, puces, bouton pause, balayage au doigt ;
  - pause quand la souris ou le focus clavier est sur une diapositive, hors de l'écran ou quand l'onglet est caché ;
  - jamais automatique si le visiteur réduit les animations.

  Performance :
  - les diapositives sont rendues par le serveur ; seules les commandes sont un petit îlot client ;
  - seule la 1re photo est prioritaire (image LCP) ; les deux autres sont chargées après la page.
- **Tuyau goutte-à-goutte (gaine / drip tape)**, dans la gamme « Arrosage & goutte-à-goutte » :
  - photo d'illustration ;
  - caractéristiques usuelles du marché, toutes marquées **« selon modèle »** et décrites comme indicatives (votre choix) ;
  - à remplacer depuis l'admin par la fiche du fournisseur.
- **Bouton AR | FR** dans l'en-tête :
  - la langue est retenue (cookie), avec les mêmes adresses de pages ;
  - elle est appliquée avant le premier affichage, donc ni saut ni mauvais sens de lecture ;
  - sont traduits : l'en-tête, les menus, le carrousel et la barre WhatsApp mobile ;
  - le reste du site (sections, catalogue, fiches, liste de devis, admin) reste en français, de gauche à droite ;
  - la police arabe n'est chargée que si un texte arabe s'affiche ;
  - les textes arabes cachés sont exclus des extraits Google.
- **Photos Unsplash** (licence Unsplash, crédits dans `public/images/_archive/2026-11-stock-unsplash/README.md`) : pompage (Bernd Dittrich) et lignes de goutte-à-goutte (Marc Pell). La diapositive « serres » réutilise une photo déjà présente.

## ⚠️ À faire avant la fusion : la migration
Le produit « gaine goutte-à-goutte » n'apparaîtra qu'après l'exécution de cette migration dans **Supabase → SQL Editor** :
`supabase/migrations/20261122100000_gaine_goutte_a_goutte.sql`

Elle peut être relancée sans risque (`on conflict do nothing`).

## Captures
`docs/screenshots/hero-slider-i18n/` : accueil FR et AR (ordinateur et mobile), menu en arabe.

## Checklist
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [x] `npm test` : 144 tests, dont :
  - cookie de langue ;
  - index du carrousel ;
  - dictionnaires FR/AR de mêmes clés ;
  - migration de la gaine (gamme, photo présente, chaque caractéristique « selon modèle »).
- [x] E2E (build de production) :
  - 3 diapositives et un seul `h1` ;
  - priorités d'images ;
  - flèches et défilement automatique ;
  - pause en mouvement réduit ;
  - bascule en arabe : `rtl`, en-tête et carrousel traduits, langue retenue d'une page à l'autre ;
  - admin, liste de devis et téléphone restent lisibles en arabe ;
  - texte arabe du carrousel du côté assombri ;
  - aucune erreur JavaScript.
- [x] E2E des phases 4, 4bis et 5 repassés : liste de devis, enregistrement des clics, animations, PWA, SEO.
- [ ] Fiche de la gaine : vérifiée après l'exécution de la migration (aujourd'hui en 404, faute de produit en base)
- [x] Lighthouse local : Accessibilité 100, Bonnes pratiques 100, SEO 100. La Performance reste dans la même plage qu'avant ; la mesure de référence est PageSpeed Insights sur saqia.site.
- [x] Revue de code de toute la branche : aucun point critique. 6 points corrigés, chacun avec un test qui échouait avant la correction :
  - admin passé de droite à gauche ;
  - texte arabe du carrousel du côté clair ;
  - liste de devis en miroir ;
  - téléphone inversé ;
  - extraits Google ;
  - lecture automatique bloquée après un clic sur une flèche.

## Points reportés (relevés par la revue)
- Les libellés d'accessibilité du carrousel (« diapositive 1 sur 3 ») restent en français en mode arabe, et aucun changement de diapositive n'est annoncé aux lecteurs d'écran en pause.
- Le menu mobile s'ouvre toujours depuis la droite, y compris en arabe.
- Les commandes du carrousel sont visibles mais inactives tant que le JavaScript n'est pas chargé (le balayage au doigt fonctionne).
- La photo de la gaine pèse 158 Ko (budget de 150 Ko) et n'utilise pas encore son aperçu flou.
- Le slogan existe à deux endroits (dictionnaire et configuration).
- Le script d'initialisation de la langue n'a pas son propre test (sa logique est la même que `lib/i18n/cookie.ts`, testé).

## Dépendances ajoutées
Aucune. La police arabe (Noto Sans Arabic) passe par `next/font`, comme les autres polices.

## Migrations SQL
`20261122100000_gaine_goutte_a_goutte.sql` (voir plus haut).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
