# feat: Phase 2 — design system « terroir moderne »

> ⚠️ **Branche empilée** sur `feat/brand-saqia`, dont les 9 derniers commits ne sont pas encore dans `main`. Fusionnez d'abord la PR de la Phase 1bis. Sinon, cette PR affichera aussi ses commits.

## Objectif
Donner au site une base visuelle cohérente et accessible : tokens de marque, composants de base, et plus aucune couleur écrite en dur.

## Changements
- **Tokens** (`app/globals.css`, `@theme static`)
  - Palettes `field`, `water`, `harvest`, `soil`, `danger` et `whatsapp` (valeurs du brief, plus des nuances intermédiaires vérifiées en contraste).
  - Échelle typographique fluide : `text-display`, `h1`, `h2`, `h3`.
  - Rayons `control`, `card` et `panel`, et ombres teintées terre.
  - Courbe `ease-out-expo` et durées de 150, 250, 400 et 700 ms.
  - Les **palettes Tailwind par défaut sont désactivées** : seules les couleurs de la marque existent.
- **Migration** : 630 classes de couleur converties automatiquement, dont tout le bleu marine de l'ancienne identité. `grep "\[#"` ne trouve plus rien dans les composants.
- **Primitives** (`components/ui`), sans dépendance :
  - `Button` (primary, secondary, ghost, whatsapp) et `Badge` ;
  - champs `Input`, `Select` et `Textarea`, avec libellé, aide et erreur reliés au champ ;
  - `Dialog` et `Sheet`, sur l'élément natif `<dialog>` ;
  - `Toast` ;
  - `Skeleton`, `EmptyState`, `SectionHeading` et `Container`.
- **Accessibilité**
  - **Focus clavier visible** partout, y compris sur les champs de recherche.
  - **Cibles tactiles de 44 px minimum** sur toutes les pages publiques et la connexion admin. C'est vérifié par un script dans le navigateur, page par page.
  - **Contraste AA** vérifié par mesure réelle des pixels sur chaque texte affiché.
  - **Mouvement réduit** respecté globalement.
- **Documentation** : `docs/design-system.md` (tokens, contrastes, règles, API des composants) et page interne `/design` (non indexée) qui montre tout.

## Captures
`docs/screenshots/2-design-system/` : accueil, catalogue, fiche produit, contact et `/design`, en mobile et en desktop.

## Checklist
- [x] `npm run lint`
- [x] `npm test` (40/40)
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] Testé dans le navigateur : ouverture et fermeture des fenêtres (✕, Échap, clic sur le fond), focus clavier, notifications
- [x] Cibles tactiles et contraste mesurés sur l'accueil, le catalogue, une fiche, le contact et la connexion admin
- [x] Revue de code. Corrections appliquées :
  - **Focus des champs :** il était invisible, car avec Tailwind 4 `outline-none` annulait `focus-visible:outline-2`.
  - **Contraste sur fond foncé :** des textes étaient trop pâles sur les sections vertes.
  - **Fenêtres :** double appel à la fermeture.
  - **Notifications d'erreur :** elles disparaissaient trop vite.
- [ ] Lighthouse : à partir de la phase 4

## Dépendances ajoutées
Aucune.

## Migrations SQL
Aucune.

## À savoir
- **Couleurs seulement :** cette phase change les couleurs et les bases, pas la mise en page. La refonte visuelle de la vitrine se fait en Phase 4 : hero, sections, cartes produit, suppression des étiquettes en capitales au-dessus des titres.
- **Composants pas encore utilisés :** le site actuel garde ses anciens composants. La vitrine et l'admin passeront aux nouvelles primitives en Phases 3 et 4.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
