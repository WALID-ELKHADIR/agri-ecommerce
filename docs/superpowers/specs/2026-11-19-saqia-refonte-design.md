# Refonte Saqia — document de conception

_Date : 2026-11-19 · Source : brief `PROMPT-CLAUDE-CODE-SAQIA.md` (fourni par le propriétaire) + échanges du 2026-11-19._

## 1. Intention et pourquoi

Saqia (anciennement AgriFlow) est un catalogue agricole marocain (pompes, raccords, kits d'irrigation, petit matériel) dont la **seule conversion est un message WhatsApp**. Il n'y a ni panier payant ni paiement en ligne. Chaque clic WhatsApp est aussi enregistré comme demande de devis dans Supabase (mini-CRM).

Le propriétaire veut :
- une vitrine **premium, très visuelle et ultra-rapide sur mobile 3G** (Lighthouse mobile ≥ 95), avec un chemin vers WhatsApp évident sur chaque écran ;
- une **identité de marque professionnelle** (nom, logo SVG, charte) ;
- un **back-office sûr et agréable** pour gérer produits, catégories, images et demandes.

Le brief complet (phases, branches, règles Git, tokens de couleur, critères) reste la référence. Ce document consigne ce qui a été **décidé ou découvert depuis**, ainsi que l'approche retenue là où le brief laissait un choix.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs** : les 9 phases du brief (0, 1, 1bis, 2, 2bis, 3, 4, 4bis, 5), dans cet ordre, une branche et une PR par phase, et le tag `v1.0.0` à la fin.

**Non-objectifs** : paiement en ligne, panier payant, comptes clients, implémentation complète du calculateur de pompe / des fiches conseils / de l'i18n arabe (seulement la structure, phase 5).

**Anti-objectifs** (échec même si « ça marche ») :
- Le logo ou une mention du fournisseur **Moyza** visible n'importe où sur le site.
- Des caractéristiques produit **inventées**, ou de faux avis clients.
- Un rendu « template générique », ou un site lent sur mobile.
- Un utilisateur connecté non-admin capable de lire ou modifier des données.
- Un coût récurrent > 0 € (Vercel Hobby + Supabase Free uniquement).

## 3. Contraintes

- Next.js 16.4 (`proxy.ts`, APIs différentes : lire `node_modules/next/dist/docs/` avant chaque API), React 19.3, Tailwind 4.3 CSS-first, Supabase (`@supabase/ssr`).
- TypeScript strict, aucun `any` ni `@ts-ignore`, textes UI en français, vouvoiement.
- Dépendances : seulement si indispensables, légères et justifiées. `sharp` est déjà présent dans `node_modules`.
- Ne jamais modifier `20261118000000_init.sql` : nouvelles migrations seulement. Demander avant toute opération destructive sur la base.
- Aucun secret commité. Ne jamais fusionner soi-même ni force-push sur `main`.

## 4. État constaté du dépôt (2026-11-19)

- **Non commité sur `main`** : admin, Server Actions, client Supabase, `proxy.ts`, migration init, nouvel accueil, modifications du catalogue, passage de pnpm à npm. → premier geste : commit `chore: sauvegarde de l'état existant` (avec accord du propriétaire).
- **Images cassées** : les 13 anciens `.jpg` ont été supprimés, mais `lib/catalog.ts` y fait encore référence. 38 photos `WhatsApp Image …jpeg` ont été ajoutées dans `public/images/products/`.
- **Sécurité** : toutes les policies d'écriture et de lecture des demandes sont `to authenticated using (true)`. `requireAdmin()` et `proxy.ts` ne vérifient que la session.
- **Encodage** : 65 lignes mojibake dans `lib/catalog.ts`. Les autres fichiers source sont propres (les correspondances dans les `.jpeg` sont des faux positifs binaires).
- **Schéma** : `products.image_url` ne contient qu'**une** image. La galerie demandée (brief, phases 3–4) nécessite une évolution du schéma.
- **Outillage** : `gh` n'est pas installé (les PR se créent via lien GitHub). Le `.gitignore` contient `.env*`, ce qui ignorerait aussi `.env.example` → ajouter `!.env.example`.
- **Le skill `ai-image-generation` n'est pas disponible** (il dépend d'un service payant) → incompatible avec le budget 0 €.

## 5. Décisions prises avec le propriétaire

1. **Les 38 photos sont le vrai stock** de Saqia et doivent être présentées. Plusieurs produits visibles ne sont pas encore au catalogue (asperseurs, vannes, coffrets de commande, clapet/crépine, injecteur d'engrais, débroussailleuses, colle PVC, etc.).
2. **Moyza est uniquement le fournisseur** : son logo, ses cartons et toute mention doivent disparaître des visuels. Seuls les produits sont montrés.
3. **Traitement des images — option C (mixte)** :
   - **Image principale** (`main.webp`, 1:1, 1200×1200) : produit **détouré** et posé sur fond uni soil-50 (#faf8f3), ombre douce, cadrage homogène (~70 % du cadre).
   - **Galerie** (`gallery-N.webp`) : photos de mise en situation (champ) **recadrées pour exclure logo et emballage Moyza**.
4. **Pas d'image générée par IA.** Hero, catégories et sections d'ambiance : photos libres de droits pour usage commercial (Unsplash / Pexels — licence vérifiée et créditée dans le manifest), à remplacer plus tard par des photos de terrain du propriétaire.
5. **Specs jamais inventées** : pour les nouveaux produits, nom et catégorie sont proposés à partir de la photo, mais les caractéristiques restent vides et sont signalées « à compléter » au propriétaire.

## 6. Approches considérées (images)

| Approche | Avantages | Inconvénients | Retenue |
|---|---|---|---|
| A. Recadrage seul | Rapide, garde l'ambiance | Rendu hétérogène (studio / champ / carrelage), carton Moyza au centre de certaines photos | Non (seule) |
| B. Détourage de tout | Catalogue homogène premium | Perd la mise en situation ; contours fragiles sur les petites photos | Non (seule) |
| **C. Détourage pour la principale + recadrage pour la galerie** | Grille nette **et** du concret sur la fiche | Deux traitements à vérifier | **Oui** |

Le détourage utilise un **outil local gratuit** (ex. `rembg` ou équivalent, choix à l'implémentation selon ce qui s'installe sur la machine). C'est un outil de **traitement ponctuel**, pas une dépendance du site. Chaque résultat est vérifié visuellement. Les photos trop petites (< ~400 px) ou au détourage raté sont listées pour être refaites par le propriétaire, et une image provisoire propre est utilisée en attendant.

## 7. Évolutions de conception liées aux décisions

- **Galerie** : nouvelle migration avec une table `product_images (id, product_id → products on delete cascade, path, alt, position, is_main, created_at)`, en lecture publique pour les produits publiés et en écriture `is_admin()`. `products.image_url` reste pour compatibilité (= image principale) jusqu'à la bascule complète. _Point à confirmer dans le plan : table dédiée vs colonne `jsonb` ; la table est préférée pour l'ordre, la suppression des fichiers Storage et les policies._
- **Catalogue** : nouvelles catégories probables (ex. « Arrosage & asperseurs », « Vannes & accessoires », « Électricité & commande », « Outillage / motoculture », « Colles & entretien »). Elles sont proposées dans le tableau d'inventaire, pas imposées.
- **Inventaire (phase 2bis, étape 1)** : tableau `photo → produit proposé → catégorie → rôle (principale/galerie/rejet) → qualité (taille, logo à retirer)`, montré au propriétaire **avant** tout traitement. Les originaux vont dans `public/images/_archive/` (rien n'est supprimé sans accord).
- **Moyza** : contrôle final par revue visuelle de la planche contact. Aucune occurrence textuelle « moyza » dans le code ni dans les métadonnées.

## 8. Ce qui reste fixé par le brief (non rediscuté)

Ordre et contenu des phases, noms de branches, Conventional Commits en français, tokens de couleur et typographies, primitives `components/ui`, règles d'animation (transform/opacity, `prefers-reduced-motion`), cibles Lighthouse/LCP/CLS, captures Playwright 390×844 et 1440×900 par phase, logo SVG avec 3 pistes et choix du propriétaire, page interne `/brand`, `docs/brand.md`.

## 9. Choix faits à la relecture (proposés, à corriger par le propriétaire)

- **Source de vérité du catalogue = Supabase.** `lib/images-manifest.ts` et une nouvelle migration de seed (produits + catégories issus de l'inventaire) alimentent la base. `lib/catalog.ts` devient un repli minimal **généré à partir du même manifest**, utilisé seulement si Supabase est injoignable, et n'est plus maintenu à la main. Le seed de la migration init (qui pointe vers les anciens `.jpg`) est corrigé par une migration ultérieure, pas modifié.
- **Devis multi-produits** : colonne `items jsonb` (liste `{slug, nom, quantité}`) ajoutée à `quote_requests` dès la migration sécurité de la phase 1, avec contraintes CHECK de taille. `product_slug` / `quantity` restent pour les devis mono-produit. Le kanban, l'export CSV et le KPI « top produits » lisent les deux.
- **Police display choisie dès la phase 1bis**, pour que le wordmark n'ait pas à être redessiné en phase 2. La phase 2 reprend cette police dans les tokens.
- **Images provisoires** : un produit dont la photo est inexploitable peut sortir en `v1.0.0` avec une image provisoire propre (silhouette sur fond soil-50, marquée `source: "placeholder"` dans le manifest). Ces produits sont listés dans la PR et au tableau de bord admin.
- **Validation Moyza** : le propriétaire valide la planche contact (`docs/images-contact-sheet.png`) dans la PR de la phase 2bis. C'est le contrôle final.

### Valeurs par défaut en attendant les réponses du propriétaire (validées le 2026-11-19)

- **Base de données** : le propriétaire applique lui-même chaque migration dans l'éditeur SQL de Supabase. Chaque PR qui touche la base fournit le SQL à exécuter et un script de vérification RLS (`scripts/check-rls.ts`, admin autorisé / non-admin refusé / anonyme limité). Si une clé service-role d'un projet de test est ajoutée plus tard dans `.env.local`, le builder lance ces vérifications lui-même.
- **Rythme** : une PR par phase, en attente de validation avant la suivante (règle du brief), sauf instruction contraire.
- **Coordonnées** : valeurs de repli factices dans les variables d'env tant que les vraies ne sont pas fournies. Lighthouse est mesuré en local (`next build && next start`) tant qu'il n'y a pas de déploiement de prévisualisation Vercel.

## 10. Laissé au builder

- Choix précis de l'outil de détourage et réglages (marges, ombre).
- Choix des photos libres de droits (dans la direction artistique du brief).
- Détail des migrations et nom exact des nouvelles catégories (soumis au propriétaire via l'inventaire).
- Découpage en tâches et en commits à l'intérieur de chaque phase.
