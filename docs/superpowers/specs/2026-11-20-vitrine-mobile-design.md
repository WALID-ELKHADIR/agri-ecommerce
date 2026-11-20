# Phase 4 — Vitrine mobile-first (`feat/vitrine-mobile`) : conception

## Intention
Saqia vend des pompes, raccords et kits d'irrigation au Maroc. La vente se conclut **uniquement sur WhatsApp**, et chaque clic WhatsApp est enregistré comme demande de devis (`quote_requests`). Les visiteurs sont surtout sur **téléphone**, souvent en 3G. La vitrine doit donc :
- **donner envie**, avec un rendu visuel et premium ;
- **rester très rapide** : Lighthouse mobile ≥ 95 sur les 4 axes, LCP < 2,5 s, CLS < 0,05 ;
- **rendre WhatsApp évident** sur chaque écran.

## Objectifs
- **Accueil complet**, dans cet ordre : hero, réassurance, catégories, produits phares, « Comment ça marche », mise en situation, FAQ, CTA final.
- **Catalogue filtrable par l'URL** (lien partageable), recherche, chips sur mobile et panneau de filtres.
- **Fiche produit** : galerie à balayer avec zoom, caractéristiques en tableau, disponibilité, produits associés, barre WhatsApp collante.
- **Liste de devis multi-produits** : ajout depuis la carte ou la fiche, tiroir récapitulatif, un seul message WhatsApp formaté, enregistrement en base avec `items` et `source`.
- **`lib/whatsapp.ts`** : le seul endroit qui construit les liens et messages WhatsApp. Il est prêt pour le routage par région, sans encore l'activer.

## Non-objectifs (phases suivantes)
- Animations au défilement, View Transitions, pulsation WhatsApp, tracé du logo : phase 4bis. Ici, seulement les états de survol et de pression demandés pour les cartes, en CSS.
- SEO avancé, JSON-LD, sitemap, PWA, arabe : phase 5.
- Routage WhatsApp par région **actif** : préparé seulement.

## Anti-objectifs (échec même si « ça marche »)
- **Un fait inventé**, quel qu'il soit : chiffre, avis, témoignage, délai, garantie, mode de paiement. Le propriétaire n'a fourni aucun chiffre : on n'affiche que des faits vérifiables dans les données (nombre de références, nombre de gammes) et ce que le cahier des charges affirme (devis gratuit sur WhatsApp, conseil technique, livraison au Maroc, devis sous 24 h).
  - Le libellé existant « Garantie constructeur » (page catalogue) n'est pas confirmé : **il est retiré**.
- **Une page d'accueil exécutée entièrement dans le navigateur.** Aujourd'hui, `components/home-page.tsx` (564 lignes) est un composant client unique : il faut le défaire.
- **Une image qui fait sauter la mise en page** (CLS), ou un `priority` ailleurs que sur l'image LCP.
- **Perdre une demande** : si l'enregistrement échoue, WhatsApp s'ouvre quand même.

## Contraintes
- Next.js 16.4 avec Cache Components :
  - lire `node_modules/next/dist/docs/` avant chaque API ;
  - `searchParams` lus dans un `<Suspense>` ;
  - cache tag `catalog` existant ;
  - pas de `Date.now()` dans un rendu pré-calculé.
- React 19.3, Tailwind 4.3 en CSS (configuration dans le CSS), primitives maison dans `components/ui`.
- **Aucune nouvelle dépendance** prévue : carrousel, swipe, zoom et tiroir sont faits maison, en CSS scroll-snap et pointer events.
- Textes en français, vouvoiement. TypeScript strict. Budget 0 €.
- Pas de nouvelle migration : `quote_requests.items` (`[{ slug, name, quantity }]`) et `source` existent déjà, avec leurs contraintes.

## Approches considérées
- **A. Sections rendues par le serveur et petits îlots client — retenue par le propriétaire.**
  - Chaque section de l'accueil est un composant serveur.
  - Seuls restent côté client : le carrousel (si besoin), l'accordéon FAQ (en `<details>`, donc sans JavaScript), le bouton « Ajouter au devis », le tiroir de devis, la galerie et le panneau de filtres.
  - Le catalogue est filtré côté serveur à partir de l'URL.
  - C'est l'approche la plus légère en JavaScript, au prix du plus gros chantier.
- **B. Garder `HomePage` côté client et ajouter les sections** : plus rapide à livrer, mais l'objectif de performance devient improbable.
- **C. Garder le filtrage dans le navigateur et synchroniser seulement l'URL** : filtres instantanés, mais tout le catalogue est envoyé au navigateur ; cela grandira avec lui.

## Conception (approche A)

### Messages WhatsApp — `lib/whatsapp.ts` (pur, testé)
- `productMessage(product, quantity)` et `quoteListMessage(items, { name, city })` :
  - message en français, une ligne par produit au format « • 2 × Pompe immergée inox 4" » ;
  - nom et ville, si fournis ;
  - lien de la fiche quand un seul produit est demandé.
- `whatsappLink(message, settings, region?)` :
  - numéro par défaut issu des réglages (`getSiteSettings`), puis de l'env ;
  - le paramètre `region` est accepté mais pas encore routé (commentaire « prêt pour le routage ») ;
  - encodage `encodeURIComponent`, longueur bornée.
- Remplace les constructions éparses (`whatsappLink` de `lib/catalog.ts`, `whatsappUrl` de `site-config.ts`), avec des alias le temps de migrer les appels.

### Enregistrement de chaque clic WhatsApp
Le cahier des charges l'exige : **chaque** clic WhatsApp crée une ligne `quote_requests`, pas seulement ceux de la fiche et du formulaire de contact.
- **Composant** : `WhatsAppLink` (petite île client) remplace les liens `wa.me` du site. Au clic :
  1. il appelle `saveQuoteRequest` sans attendre la réponse ;
  2. il laisse le lien s'ouvrir normalement : le clic n'est jamais bloqué.
- **Clic générique** (sans produit) : il est enregistré avec un message descriptif, par exemple « Contact WhatsApp depuis l'accueil ». `validateQuoteInput` accepte ce cas quand `source` est connue. La limite de débit en base reste active. *(Choix du constructeur.)*
- **Valeurs de `source`** (≤ 40 caractères) : `accueil-hero`, `accueil-cta`, `header`, `carte-produit`, `fiche-produit`, `barre-mobile`, `liste-devis`, `contact`, `footer`. Les statistiques « origine des demandes » de l'admin les affichent telles quelles.

### Liste de devis — `components/quote-list/*`
- **Stockage** : `lib/quote-list-store.ts` (pur et testable), sur `useSyncExternalStore`.
  - Clé `localStorage` `saqia:devis:v1`, lecture et écriture dans un try/catch : navigation privée ou stockage plein ne cassent rien, la liste vit alors en mémoire.
  - Synchronisation entre onglets via l'événement `storage`.
  - Quantité de 1 à 99, au plus 50 produits (la contrainte SQL l'exige).
- **`AddToQuoteButton`** (île client) sur la carte et la fiche.
  - Après l'ajout : retour visuel « Ajouté » et compteur du header qui rebondit. L'animation « vers l'icône » est simplifiée : pastille + rebond, en transform/opacity, désactivée avec `prefers-reduced-motion`. La trajectoire complète est en 4bis.
- **Tiroir** (`QuoteDrawer`), ouvert depuis l'icône du header et depuis la barre mobile :
  - lignes avec quantité modifiable et bouton pour retirer ;
  - champs Nom et Ville (facultatifs) ;
  - bouton « Envoyer sur WhatsApp ».
- **Envoi** :
  1. la Server Action `saveQuoteRequest` reçoit `items` et `source: "liste-devis"` ;
  2. la fenêtre WhatsApp est ouverte **dans le même geste** (pour éviter le blocage des popups), sans attendre la réponse du serveur ;
  3. la liste est vidée seulement après l'ouverture.
- **Validation serveur** : `validateQuoteInput` accepte `items` (forme, bornes) et `city`. Une ville sans colonne dédiée va dans `message` : **pas de migration**.

### Page d'accueil — `app/page.tsx` et `components/home/*`
- `HomePage` client est remplacé par des sections serveur. Chaque section a son fichier ; le header et le pied de page restent ceux de l'application.

| Section | Contenu (faits sûrs uniquement) |
|---|---|
| Hero | Plein écran, `<picture>` avec art direction (`hero/home-mobile.webp` en 4:5, `hero/home.webp` en 16:9), seule image en `priority` ; dégradé ; titre display ; slogan de la marque ; CTA « Demander un devis sur WhatsApp » + « Voir le catalogue ». |
| Réassurance | 3 points, tels que le propriétaire les a écrits dans son cahier des charges (« livraison nationale, conseil technique, devis sous 24 h ») : livraison partout au Maroc, conseil technique, devis sous 24 h. |
| Catégories | Grandes cartes visuelles : image de catégorie (admin, sinon image du produit phare de la gamme), nom, nombre de références. |
| Produits phares | Carrousel horizontal en CSS scroll-snap (aucun JavaScript nécessaire), cartes produit, lien « Tout voir ». |
| Comment ça marche | 3 étapes : choisir ses produits → envoyer la liste sur WhatsApp → recevoir le devis et les conseils. |
| Mise en situation | Grande image (`sections/*.webp`) et chiffres **vérifiables** : X références, Y gammes, « Devis gratuit ». |
| Témoignages | **Masqué** tant qu'aucun contenu réel n'existe. Composant prêt, désactivé (aucun avis inventé). |
| FAQ | `<details>` natif, 4 à 6 questions dont les réponses découlent des faits connus : comment demander un devis, est-ce payant (non), livrez-vous partout au Maroc, puis-je avoir un conseil pour choisir ma pompe, comment envoyer plusieurs produits. |
| CTA final | Bandeau WhatsApp. |

### Catalogue — `app/produits/page.tsx`
- **URL** : `?q=`, `?gamme=`, `?dispo=` (disponible / sur commande), `?tri=`.
  - Filtrage et tri faits par une fonction pure testée (`lib/catalog-query.ts`) côté serveur, dans un `<Suspense>` avec squelettes.
- **Filtres par caractéristique** : les valeurs actuelles sont du texte libre (« 0,75 – 7,5 kW », « Ø20 – 63 mm ») et ne se prêtent pas à des filtres fiables. *(Choix du constructeur.)*
  - **Disponibilité** : les options sont les valeurs de `stock` réellement présentes dans le catalogue publié (aujourd'hui « Disponible », « Sur demande », « Sur commande »), comparées sans casse ni accents. Une valeur saisie à la main dans l'admin devient automatiquement une option : aucun produit n'est caché par une liste figée.
  - **Pas de filtre « alimentation »** : seuls 3 produits la renseignent, et « 220 / 380 V » correspond aux deux options, donc le filtre viderait presque toujours la grille.
  - Les autres facettes attendent des caractéristiques structurées (piste notée pour plus tard, avec une migration).
- **Mobile** : chips de gammes défilables, bouton « Filtres » qui ouvre un panneau (Sheet maison basé sur `Dialog`).
- **Desktop** : barre de filtres visible.
- **Recherche** : formulaire GET, insensible aux accents (même logique que l'admin).
- **Grille** : 2 colonnes sur mobile, 3 sur tablette, 4 sur desktop, avec état vide et lien « Effacer les filtres ».
- `CatalogBrowser` (client) et `lib/catalog-filters.ts` sont supprimés. `QuickView` est retiré : le catalogue mène à la fiche, plus simple et plus léger.

### Carte produit — `components/product-card.tsx` (serveur) et bouton client
- Image 1:1 avec `next/image`, `sizes` exacts selon la grille et le flou existant (`imageBlurDataURL`).
- Badge, nom, 2–3 caractéristiques clés (les premières), gamme, « Ajouter au devis » et icône WhatsApp.
- **Survol desktop** : élévation légère, zoom doux de l'image et, si la galerie en a une, seconde image en fondu.
- **Pression mobile** : `active:scale-[0.98]`.

### Fiche produit — `app/produits/[slug]/page.tsx`
- **Galerie** (île client) :
  - balayage par scroll-snap natif, points et miniatures ;
  - zoom par une vue plein écran (Dialog), sans dépendance ;
  - la première image est en `priority` (LCP de la page), les autres en lazy.
- Caractéristiques en tableau `<dl>` ou `<table>`, disponibilité, description, ajout au devis avec quantité, WhatsApp direct.
- **« WhatsApp direct »** envoie **ce produit seul**, avec la quantité choisie, même si la liste de devis contient d'autres produits. La liste a son propre bouton d'envoi dans le tiroir. *(Choix du constructeur : deux gestes clairs plutôt qu'un mélange.)*
- **Produits associés** (même gamme, déjà fournis par `getRelatedProducts`).
- **Barre collante mobile** : « Ajouter au devis » + « WhatsApp ». Elle remplace `MobileCta` sur cette page.

### Images et performance
- `sizes` calculés par contexte : carte de grille, carrousel, galerie, hero. `priority` uniquement sur le hero de l'accueil et la première image de la fiche.
- Ratios fixes partout (`aspect-square`, `aspect-[4/5]`, `aspect-video`).
- Polices : `next/font` avec `display: swap` et sous-ensemble `latin` (à vérifier dans `layout.tsx`).
- **JavaScript client** de l'accueil : header (menu mobile, compteur de devis), boutons d'ajout, tiroir. Rien d'autre.
- **Mesures** : Lighthouse mobile (CLI ou Chrome) sur `/`, `/produits` et une fiche, en build de production. Résultats dans la PR.

### Tests
- **Unitaires** (`node --test`) : `lib/whatsapp.ts` (messages, encodage, bornes), `lib/quote-list-store.ts` (ajout, quantité, bornes, stockage indisponible), `lib/catalog-query.ts` (filtres, accents, tri), validation des `items`.
- **E2E local** (Playwright, hors dépôt) : ajout au devis depuis la carte et la fiche, tiroir, envoi (enregistrement vérifié en base puis supprimé), filtres d'URL.

## Laissé au constructeur
- Découpage exact des composants et noms de fichiers sous `components/home/` et `components/quote-list/`.
- Libellés précis des textes, dans le respect des faits ci-dessus.
- Choix des 2–3 caractéristiques clés affichées sur les cartes, si un ordre plus pertinent que « les premières » se dégage.
