# feat: Phase 4bis — animations et micro-interactions

> ⚠️ **Cette branche part de `feat/vitrine-mobile`** (phase 4), qui n'était pas encore fusionnée. Fusionnez d'abord la PR de la phase 4 : celle-ci ne contiendra alors plus que les changements de la phase 4bis.

## Objectif
Une vitrine vivante et premium, sans jamais la ralentir ni retarder l'affichage du contenu.

Conception : `docs/superpowers/specs/2026-11-21-animations-ui-design.md`
Plan : `docs/superpowers/plans/2026-11-21-animations-ui.md`

## Changements
- **Apparition au défilement** des sections, avec une cascade de 70 ms dans les grilles.
  - Fait en CSS avec les timelines de défilement. Pour les navigateurs qui ne les gèrent pas, un seul observateur prend le relais.
  - Rien de ce qui est visible à l'ouverture n'est caché, même en arrivant par un lien du type `/#faq`. Sans JavaScript, tout est visible.
- **Compteurs** : 25 références et 6 gammes comptent à leur apparition. Le serveur affiche déjà la valeur finale.
- **Parallaxe** discrète des grandes photos, sur ordinateur, en CSS.
- **Cartes** : inclinaison 3D très légère, seulement à la souris, gérée par un seul écouteur pour tout le site. Ombre teintée au survol.
- **Transition catalogue → fiche** : l'image de la carte se transforme en image de la fiche, grâce au `<ViewTransition>` natif de React. Sans prise en charge du navigateur, la navigation est normale.
- **Header** : il se compacte au défilement (ombre, logo réduit). Le menu mobile devient un tiroir latéral animé.
- **Conversion** :
  - pulsation discrète du bouton WhatsApp toutes les 8 s ;
  - à l'ajout au devis, une pastille vole vers « Ma liste » ;
  - un toast « … ajouté à votre liste » s'affiche, avec un bouton « Voir la liste ».
- **Logo** : le tracé du canal d'eau s'anime sur l'accueil, une fois par visite.
- **Règles respectées** :
  - seules `transform` et `opacity` sont animées (le texte des compteurs excepté) ;
  - tout est coupé avec « réduire les animations » ;
  - aucune dépendance ajoutée ;
  - aucun composant client par carte : un composant global `Motion`, plus 2 petits compteurs.
- **Titre du hero** : il reste visible immédiatement (décision de votre part, option A).

## Vidéo et captures
- `docs/screenshots/4bis-animations/animations.webm` : défilement de l'accueil, ajout au devis, passage à une fiche (mobile).
- Captures 390×844 et 1440×900 de l'accueil et du catalogue, plus le menu mobile et le toast.
- Les captures pleine page sont prises en mode « animations réduites », pour que tout le contenu soit visible.

## Mesures Lighthouse (local, même PC que la phase 4)
| Page | Phase 4 | Phase 4bis |
|---|---|---|
| `/` : Performance, TBT | 64, 870 ms | 61–68, 690–1 220 ms |
| `/produits` : Performance, TBT (médiane de 4 passes) | 61–64, 920–1 290 ms | 56–70, ~965 ms |
| Accessibilité / Bonnes pratiques / SEO | 98–100 / 100 / 100 | 98–100 / 100 / 100 |

Aucune régression mesurable. Comme en phase 4, le score Performance local n'est pas fiable sur ce PC : la mesure de référence reste PageSpeed Insights sur le déploiement Vercel.

## Checklist
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [x] `npm test` : 124 tests (dont inclinaison, compteur, décision de cacher, trajet du vol)
- [x] E2E animations (Playwright, build de production) :
  - FAQ cachée sous la flottaison puis révélée au défilement ;
  - `/#faq` visible immédiatement ;
  - titre jamais caché ;
  - « réduire les animations » : rien de caché, compteurs à leur valeur ;
  - compteur animé ;
  - vol et toast ;
  - menu mobile ;
  - passage carte → fiche ;
  - inclinaison à la souris ;
  - aucune erreur JavaScript.
- [x] E2E de la phase 4 entièrement repassé : liste de devis, enregistrement des clics, filtres
- [x] Pas de régression Lighthouse
- [ ] Performance ≥ 95 : à confirmer avec PageSpeed Insights sur Vercel

## Dépendances ajoutées
Aucune.

## Migrations SQL
Aucune.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
