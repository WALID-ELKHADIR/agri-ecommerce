# Phase 4bis — Animations et micro-interactions (`feat/animations-ui`) : conception

Branche créée depuis `feat/vitrine-mobile` : la PR de la phase 4 n'était pas encore fusionnée.

## Intention
Donner à la vitrine une sensation vivante et premium, sans jamais la ralentir ni retarder l'affichage du contenu. Chaque animation doit servir : montrer ce qui a changé, guider vers WhatsApp, relier le catalogue à la fiche.

## Objectifs
- **Apparition au défilement** : fondu et translation douce. Pour les grilles, cascade de 70 ms entre éléments.
- **Compteurs** animés pour les chiffres de la mise en situation.
- **Parallaxe** subtile des grandes images, sur ordinateur seulement.
- **Cartes** : élévation, zoom de l'image, ombres teintées, passage à la seconde image, inclinaison 3D très légère (pointeur fin seulement).
- **Transition** catalogue → fiche : l'image de la carte se transforme en image de la fiche.
- **Header** qui se compacte au défilement ; menu mobile en tiroir animé.
- **Pulsation** discrète du bouton WhatsApp toutes les ~8 s.
- **Ajout au devis** : pastille qui vole vers « Ma liste » et toast de confirmation.
- **Logo** : tracé du canal d'eau, une fois par visite.

## Non-objectifs
- Titre du hero révélé mot par mot. Décision du propriétaire (option A) : le titre reste visible immédiatement.
- Toute librairie d'animation.

## Anti-objectifs (échec même si « ça marche »)
- Une animation qui retarde le LCP ou cache du contenu au chargement.
- Une régression du score Lighthouse ou du temps de blocage par rapport à la phase 4.
- Un composant client par carte ou par élément animé : la phase 4 a montré que cela coûte environ 50 ms de blocage par carte.
- Une animation qui touche autre chose que `transform` et `opacity`.
- Une animation active malgré `prefers-reduced-motion: reduce`.

## Contraintes
- Next.js 16.4 et React 19.3 : `<ViewTransition>` natif, sans configuration (voir `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`).
- Tailwind 4 configuré en CSS. Aucune dépendance. TypeScript strict. Textes en français.

## Approches
Une seule est raisonnable sous ces contraintes : **le CSS d'abord, et un seul composant client global** pour ce qui demande du JavaScript.
- Une librairie (`motion`) ajouterait du JavaScript, contraire à l'objectif de performance.
- Un hook par élément recréerait le coût d'hydratation par carte.

## Conception

### Apparition au défilement
- **Marquage** : attribut `data-reveal` sur les éléments, `style="--i: n"` pour la cascade.
- **Navigateurs récents** : CSS `animation-timeline: view()` sous `@supports`. Un élément déjà dans l'écran au chargement est d'emblée à la fin de sa plage : il n'est jamais caché.
- **Autres navigateurs** : `useReveal` (un `IntersectionObserver` unique) est utilisé par le composant global `Motion`.
  - Il ne cache que les éléments **sous la ligne de flottaison** au moment du montage. Ceux qui sont visibles à l'ouverture restent affichés.
  - Il pose `data-revealed` quand l'élément entre dans l'écran.
- **Sans JavaScript** : tout est visible.

### Compteurs
- Marquage : `data-count-to="25"`. Le serveur affiche déjà la valeur finale.
- `Motion` remet le compteur à 0 juste avant qu'il entre dans l'écran, puis l'anime en 800 ms (`requestAnimationFrame`, seul le texte change).
- Avec `prefers-reduced-motion`, rien ne bouge.

### Parallaxe
- CSS uniquement : `animation-timeline: view()` avec `translateY` de ±6 %, sur l'image de la mise en situation et les cartes de gammes.
- Seulement avec `(min-width: 1024px)` et sans préférence de mouvement réduit.
- Sans prise en charge du navigateur : image fixe.

### Cartes
- **Ombre teintée** au survol (couleur `field` translucide).
- **Inclinaison 3D** : attribut `data-tilt` sur la carte.
  - `Motion` écoute `pointermove` une seule fois (délégation), avec `(hover: hover) and (pointer: fine)`.
  - Mise à jour limitée par `requestAnimationFrame` des variables `--rx` et `--ry`, au plus 4°.
  - Transform `perspective(800px) rotateX(...) rotateY(...)`, remis à zéro au `pointerleave`.

### Transition catalogue → fiche
- Le même `<ViewTransition name={"produit-" + slug} share="morph" default="none">` entoure :
  - l'image de la carte ;
  - la première image de la galerie de la fiche.
- CSS `::view-transition-group(.morph)` : 380 ms.
- Coupé avec `prefers-reduced-motion`.

### Header
- **Compactage** au défilement, par une timeline CSS `scroll()` sur la racine :
  - le bandeau d'information du haut glisse et disparaît (`translateY` + `opacity`) ;
  - l'ombre du header apparaît (opacité d'un pseudo-élément).
- **Sans prise en charge du navigateur** : `Motion` pose `data-scrolled` sur `<html>` après 40 px (écouteur passif).
- **Menu mobile** : le panneau déroulé est remplacé par le `Sheet` existant (côté droit, déjà animé).

### Pulsation WhatsApp
- Classe `.wa-pulse` : un anneau (pseudo-élément) dont l'échelle et l'opacité s'animent pendant les 600 premières ms d'un cycle de 8 s, puis restent au repos.
- Appliquée au bouton WhatsApp de la barre mobile et du header.

### Ajout au devis
- Le `ClickTracker` existant, après l'ajout, crée une pastille (`position: fixed`).
  - Il l'anime avec la Web Animations API, en `transform` et `opacity`, du bouton jusqu'à l'icône « Ma liste » visible (header ou barre mobile), puis la retire.
- Il affiche ensuite un toast léger dans une zone `aria-live` : « {produit} ajouté à votre liste », avec un bouton « Voir la liste » qui ouvre le tiroir. Le toast disparaît après 3 s.
- Avec `prefers-reduced-motion` : pas de vol, le toast s'affiche seul.

### Logo
- `Logo animated` dans le header de l'accueil, déjà prévu par le composant.
- `Motion` retire l'animation après la première visite de la session (`sessionStorage`, protégé par try/catch). L'animation n'est pas rejouée à chaque navigation.

### Vérification
- Lighthouse local avant/après sur `/` et `/produits`, en comparant le TBT et le LCP à la phase 4 (même PC, plusieurs passes).
- Playwright :
  - un élément sous la flottaison est caché puis révélé ;
  - un élément visible au chargement n'est jamais caché ;
  - avec `reducedMotion: "reduce"`, rien n'est caché ;
  - le vol vers « Ma liste » et le toast s'affichent ;
  - aucune erreur JavaScript.
- Vidéo WebM des animations enregistrée par Playwright pour la PR.

## Laissé au constructeur
- Courbes d'accélération exactes et amplitudes, dans les bornes ci-dessus.
- Liste exacte des sections marquées `data-reveal`.
