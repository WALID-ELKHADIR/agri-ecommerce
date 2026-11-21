# feat: Phase 4 — vitrine mobile-first

## Objectif
Une vitrine visuelle et rapide sur téléphone, où chaque écran mène à WhatsApp et où chaque clic WhatsApp devient une demande suivie dans l'admin. La vitrine permet aussi de demander plusieurs produits en un seul message.

Conception : `docs/superpowers/specs/2026-11-20-vitrine-mobile-design.md`
Plan : `docs/superpowers/plans/2026-11-20-vitrine-mobile.md`

## Changements
- **Accueil reconstruit en sections rendues par le serveur.** L'ancien composant client de 564 lignes est supprimé. Sections :
  - hero plein écran : photo recadrée en 4:5 sur mobile et 16:9 sur ordinateur ;
  - engagements ;
  - gammes en grandes cartes, avec l'image choisie dans l'admin ;
  - carrousel des produits mis en avant, sans JavaScript ;
  - « Comment ça marche » ;
  - mise en situation avec des chiffres tirés du catalogue ;
  - FAQ ;
  - CTA final.
- **Liste de devis multi-produits.**
  - Bouton « Ajouter au devis » sur les cartes et les fiches.
  - Compteur dans le header et bouton « Ma liste » dans la barre mobile.
  - Tiroir récapitulatif : quantités, nom et ville facultatifs.
  - Un seul message WhatsApp, enregistré avec ses produits (`source = liste-devis`).
  - L'envoi passe par un vrai lien, que les bloqueurs de fenêtres n'arrêtent pas.
  - La liste reste en place après l'envoi : le visiteur la vide lui-même avec « Vider la liste » (rien ne garantit que WhatsApp s'est bien ouvert).
  - La liste est gardée sur l'appareil et continue de fonctionner en navigation privée.
- **Chaque clic WhatsApp est enregistré**, avec son origine (`accueil-hero`, `header`, `carte-produit`, `fiche-produit`, `barre-mobile`, `footer`, `contact`…). L'origine apparaît dans les statistiques de l'admin. L'enregistrement ne retarde jamais l'ouverture de WhatsApp.
- **Le numéro WhatsApp des réglages de l'admin** s'applique désormais à tous les liens et à la liste de devis. Il est fourni par le layout ; les variables d'env servent de repli.
- **Catalogue filtré par l'URL**, donc partageable.
  - Recherche sans accents, y compris dans les caractéristiques.
  - Gammes en chips défilables, disponibilité et tri.
  - Panneau « Filtres » sur mobile, barre de filtres sur ordinateur.
  - Fonctionne sans JavaScript. Squelettes de chargement et état vide avec « Effacer les filtres ».
- **Fiche produit.**
  - Galerie à balayer, miniatures, vue agrandie avec zoom ×2.
  - Caractéristiques en tableau et disponibilité.
  - Ajout au devis avec quantité et bouton WhatsApp pour ce produit seul.
  - Barre collante mobile ; produits de la même gamme.
- **`lib/whatsapp.ts`** : seul constructeur des messages et des liens. Les messages trop longs sont tronqués proprement (« … et N autres produits »). Il est prêt pour le routage par région, sans l'activer.
- **Aucun fait inventé.** « Garantie constructeur » et « Service après-vente », non confirmés, sont retirés du catalogue, de la fiche et du pied de page. La section témoignages existe, mais reste masquée tant qu'aucun avis réel n'est fourni.

## Captures
`docs/screenshots/4-vitrine/` (mobile 390×844 et desktop 1440×900) :
- accueil ;
- catalogue filtré (`?gamme=pompes`) ;
- fiche produit ;
- tiroir de devis (mobile) et panneau de filtres (mobile).

## Mesures (build de production, mobile émulé « Slow 4G », CPU ×4)
| Page | LCP | CLS | JS (décompressé) |
|---|---|---|---|
| `/` | 2,08 s | 0,000 | 497 Ko |
| `/produits` | 2,19 s | 0,000 | 274 Ko |
| fiche produit | 1,65 s | 0,000 | 451 Ko |

LCP < 2,5 s et CLS < 0,05 sur les trois pages.

### Lighthouse mobile (Lighthouse 12, en local sur ce PC)
| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| `/` | 64 | 100 | 100 | 100 |
| `/produits` | 61–64 | 98 | 100 | 100 |
| fiche produit | 62–77 | 100 | 100 | 100 |
| *référence : `/admin/login`, page presque vide* | *81* | | | |

**Le score Performance local n'est pas fiable sur ce PC.**
- Lighthouse le signale lui-même : l'indice de puissance de la machine (*benchmarkIndex* 760–1 260) est sous son seuil de fiabilité.
- Il simule en plus un processeur 4 fois plus lent. Le temps de blocage est donc gonflé, et les écarts d'une mesure à l'autre sont grands.
- Même une page presque vide plafonne à 81.
- **Mesure de référence à faire :** PageSpeed Insights sur le déploiement Vercel (preview ou production).

**Corrigé grâce à ces mesures :**
- les cartes ne sont plus hydratées une par une : un seul écouteur de clics pour tout le site ;
- l'image LCP du catalogue est préchargée.

Résultat sur le catalogue : temps de blocage de ~2 s à ~0,9–1,3 s.

## Checklist
- [x] `npm run lint`
- [x] `npm test` : 119 tests (messages WhatsApp, liste de devis, filtres du catalogue, sources des clics, clics délégués)
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] Test de bout en bout sur votre base (Playwright) :
  - ajout depuis une carte et depuis une fiche ;
  - liste conservée après rechargement ;
  - tiroir : quantités, nom, ville, envoi → message WhatsApp avec les 2 produits, puis « Vider la liste » ;
  - même numéro WhatsApp pour la liste et pour le hero (numéro des réglages) ;
  - demande `liste-devis` enregistrée avec ses produits ;
  - clic WhatsApp du hero enregistré ;
  - filtres d'URL et panneau mobile ;
  - aucune erreur JavaScript.

  Les demandes de test ont été supprimées.
- [x] LCP < 2,5 s, CLS < 0,05 (mesure Playwright ci-dessus)
- [x] Revue de code de toute la branche : aucun point critique ; 4 points importants corrigés, plus 2 textes non confirmés retirés
- [x] Lighthouse local : Accessibilité 98–100, Bonnes pratiques 100, SEO 100
- [ ] Performance ≥ 95 : à confirmer avec PageSpeed Insights sur le déploiement Vercel (la mesure locale n'est pas fiable sur ce PC)

## Points mineurs reportés (relevés par la revue)
- Zoom de la galerie non utilisable au clavier.
- Aucun retour visuel quand la liste atteint 50 produits.
- « … et 1 autres produits » au singulier.
- Boutons de quantité de la fiche à 32 px.
- Bouton « Filtres » sans état ARIA.
- Barre mobile qui se redimensionne après chargement quand une liste existe.
- État vide du catalogue sans lien WhatsApp.
- Doublons possibles si le stockage du navigateur est corrompu.
- `preload` et `loading` combinés sur la première image de la galerie.

## Dépendances ajoutées
Aucune.

## Migrations SQL
Aucune. Les colonnes `quote_requests.items` et `source` existent depuis la phase 1.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
