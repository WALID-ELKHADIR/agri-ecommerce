# feat: Phase 3 — admin complet

## Objectif
Gérer tout le catalogue et les demandes depuis l'admin, sans toucher au code : catégories, produits et photos, suivi des demandes, coordonnées du site.

## Changements
- **Migration `20261121100000_admin_complet.sql`** (déjà appliquée sur votre base)
  - Bucket d'images `product-images` : public en lecture, écriture réservée aux admins, 2 Mo max, WebP / JPEG / PNG.
  - Galerie des produits (`product_images`), avec une seule image principale par produit.
  - Table des réglages et image de catégorie.
- **Catégories** : création, modification, ordre (flèches), image. Une catégorie qui contient des produits ne peut pas être supprimée, et un message clair l'explique.
- **Produits**
  - Liste : recherche (sans accents), filtres catégorie et statut, tri, vignettes.
  - Actions en un clic : publier ou masquer, mettre en avant, dupliquer.
  - Badge « Caractéristiques à compléter ».
  - Un produit sans photo ne peut pas être publié.
- **Photos** : glisser-déposer ou sélection, recadrage carré guidé (zoom et décalages, au clavier aussi), compression WebP dans le navigateur (1600 px max), envoi direct dans Supabase, galerie réordonnable (glisser ou flèches), image principale, texte alternatif par photo. Une photo retirée est supprimée de Storage, sauf si un autre produit (copie) ou une catégorie l'utilise encore.
- **Demandes**
  - Vue liste et vue de suivi (kanban : nouvelle → contactée → gagnée / perdue).
  - Filtres statut, origine, période, recherche (nom, téléphone, produit).
  - Produits de la liste de devis affichés.
  - Bouton « Répondre sur WhatsApp », prérempli vers le client.
  - Export CSV filtré, lisible par Excel.
- **Tableau de bord** : demandes à traiter, demandes sur 7 et 30 jours, taux de gain, produits en ligne et fiches à compléter, plus trois petits graphiques (demandes par jour, produits les plus demandés, origine des demandes).
- **Réglages**
  - Numéro WhatsApp, téléphone, e-mail, adresse et horaires. Un champ vide reprend la valeur par défaut.
  - Numéros par région : préparés, mais pas encore utilisés.
  - **Le pied de page et la page contact utilisent ces réglages.**
- **Robustesse (après revue de code)**
  - Remplacement de galerie sans perte : les nouvelles photos sont enregistrées avant que les anciennes soient retirées.
  - Une photo illisible (HEIC d'iPhone…) affiche un message sans bloquer les autres ; l'enregistrement du formulaire et Échap sont bloqués pendant un envoi.
  - Seules les images du projet Supabase sont acceptées par le serveur.
  - Export CSV : les numéros « +212 … » restent lisibles, les formules restent neutralisées.
- **Confort** : notification après chaque action, page d'erreur avec bouton « Réessayer », états vides avec une action pour en sortir.

## Captures
`docs/screenshots/3-admin/` : connexion et page contact.

⚠️ Les écrans de l'admin connecté n'ont pas pu être capturés : je n'ai pas de compte admin de test (voir ci-dessous).

## Checklist
- [x] `npm run lint`
- [x] `npm test` : 83 tests, dont les droits Storage, galerie et réglages sur un vrai Postgres
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] Sur votre base : migrations présentes, bucket lisible publiquement, envoi anonyme refusé, toutes les pages admin (y compris l'export CSV) redirigées vers la connexion sans session
- [ ] Parcours admin connecté (envoi de photos, catégories, réglages) : à faire avec un compte admin de test
- [ ] Lighthouse : à partir de la phase 4

## Dépendances ajoutées
Aucune.

## Migrations SQL
`20261121100000_admin_complet.sql`, déjà appliquée sur votre base.

## Pour la suite (Phase 4)
- **Numéros WhatsApp par région :** le routage sera branché dans `lib/whatsapp.ts`. Les boutons WhatsApp du header et des cartes produit utiliseront alors aussi le numéro des réglages.
- **Images d'ambiance :** elles seront intégrées aux pages.
- **Fichiers orphelins :** une photo envoyée puis abandonnée (formulaire non enregistré) reste dans Storage. Un nettoyage périodique pourra être ajouté.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
