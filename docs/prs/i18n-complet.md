# feat: site et administration entièrement en français et en arabe, photo du tuyau goutte-à-goutte

## Objectif
- Proposer **tout** le site en français et en arabe, avec le sélecteur AR | FR :
  - la vitrine : accueil, catalogue, fiches, contact, liste de devis, messages WhatsApp ;
  - toute l'administration ;
  - lecture de droite à gauche en arabe, sur chaque écran.
- Remplacer les visuels provisoires du tuyau goutte-à-goutte par la photo fournie, sur la fiche, les cartes du catalogue et l'accueil.

## Changements

### Une version par langue, aux mêmes adresses
- Chaque page existe en français et en arabe, toutes deux pré-générées. Le serveur envoie directement la bonne langue, avec `lang` et `dir` sur `<html>` :
  - pas de double texte dans la page ;
  - pas de bascule après l'affichage.
- Les adresses ne changent pas (`/produits`, `/contact`…). La langue choisie est retenue par un cookie.
- Une ancienne adresse `/ar/...` ou `/fr/...` redirige vers l'adresse normale et retient la langue.
- Google indexe la version française (choix validé).

### Vitrine traduite
- Traduits : accueil, catalogue (filtres, tri, disponibilités), fiche produit, galerie, contact, formulaire de devis, pied de page, page 404 et titres/descriptions des pages.
- **Messages WhatsApp rédigés dans la langue du visiteur** : produit, liste de devis, formulaire, message général.
- Le profil choisi dans le formulaire reste enregistré en français, pour que l'équipe voie toujours les mêmes valeurs.
- Numéros de téléphone et e-mails toujours affichés de gauche à droite.

### Administration traduite
- Sélecteur AR | FR dans la barre latérale, dans l'en-tête mobile et sur la page de connexion.
- Écrans traduits :
  - tableau de bord (indicateurs, graphiques, origines des demandes) ;
  - produits, catégories (formulaires, images, recadrage) ;
  - demandes : statuts, kanban, filtres et **export CSV** avec les en-têtes dans la langue ;
  - réglages, connexion et page d'erreur.
- Dates au format de la langue, en chiffres latins.
- Les messages après une action (« Produit enregistré », « E-mail invalide »…) suivent la langue de l'administrateur. Un message d'erreur technique de la base reste affiché tel quel.

### Contenu des produits en arabe (votre choix : champs dans l'admin)
- Nouvelle section **« Version arabe (facultatif) »** dans les formulaires :
  - produit : nom, description, caractéristiques ;
  - catégorie : nom, nom court, description.
- Sur le site arabe, chaque champ rempli remplace le texte français. **Un champ vide garde le français.**
- Aucune traduction automatique, aucune valeur inventée.
- Le contenu saisi est isolé (`<bdi>`) : la ponctuation d'un nom français reste au bon endroit dans une page arabe.

### Droite à gauche
- Propriétés logiques (début/fin au lieu de gauche/droite).
- Flèches retournées en arabe.
- Le tiroir latéral (liste de devis, menu) s'ouvre depuis la gauche en arabe.
- Galerie de la fiche au bon sens de défilement.
- Plus aucun défilement horizontal parasite.

### Photo du tuyau goutte-à-goutte (branche `fix/photo-gaine`, incluse ici)
- La photo fournie remplace le visuel Unsplash : fond blanc retiré, produit centré.
- Le visuel Unsplash est retiré.
- Le produit est « mis en avant », donc présent dans « Sélection du moment » sur l'accueil.
- Nouveau nom de fichier (`fournisseur.webp`) pour que l'ancienne image en cache ne s'affiche plus.

## Migrations SQL (Supabase → SQL Editor)
1. `20261123100000_gaine_photo_fournisseur.sql` : **déjà appliquée** sur votre base (vérifié : photo, texte alternatif et mise en avant).
2. `20261124100000_contenu_arabe.sql` : **à exécuter**. Elle ajoute les champs arabes, facultatifs et vides.
   - Elle peut être relancée sans risque.
   - Avant son exécution, le site et l'admin fonctionnent normalement. Seuls les champs arabes ne sont pas enregistrés.

## À faire relire
- **Tous les textes arabes** (`lib/i18n/ar.ts`, `lib/i18n/admin-ar.ts`) doivent être relus par un arabophone avant la mise en ligne.
- Un point de vocabulaire à trancher : « طلب السعر » et « عرض سعر » sont tous deux utilisés pour « devis ».

## Captures
`docs/screenshots/i18n-complet/` :
- vitrine en arabe : accueil, catalogue et fiche de la gaine sur mobile, liste de devis ;
- fiche de la gaine en français ;
- admin en arabe : tableau de bord, nouveau produit, message d'erreur traduit.

## Checklist
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [x] `npm test` : 177 tests, dont :
  - routage des langues ;
  - messages WhatsApp en arabe ;
  - dictionnaires FR/AR de mêmes clés, vitrine et admin ;
  - messages après action ;
  - contenu arabe avec repli en français ;
  - champs arabes de l'admin ;
  - migration du contenu arabe (colonnes facultatives, refus d'une valeur invalide, relance) ;
  - photo de la gaine.
- [x] E2E vitrine (build de production), français et arabe, ordinateur et mobile :
  - `lang`/`dir` corrects, titres traduits, 404 traduite ;
  - photo de la gaine sur la fiche, la carte et l'accueil ;
  - liste de devis et message WhatsApp dans la langue ;
  - aucun débordement horizontal, aucune image cassée, aucune erreur JavaScript.
- [x] E2E admin connecté, français et arabe :
  - 8 écrans traduits, aucun texte français restant en arabe ;
  - message d'erreur traduit (e-mail invalide, refusé avant tout enregistrement) ;
  - export CSV dans la langue ;
  - aucune erreur JavaScript.
- [x] Comportement sans la migration du contenu arabe vérifié sur votre base : PostgREST répond `PGRST204`, et l'enregistrement est refait sans les champs arabes.
- [x] Revue de code de toute la branche : **aucun point critique**. 4 points corrigés, chacun avec un test qui échouait avant la correction :
  - menu actif et écart d'hydratation (l'adresse vue par le serveur contient `/fr`) ;
  - champs arabes saisis avant la migration : l'admin est maintenant prévenu qu'ils n'ont pas été gardés ;
  - redirection `/ar//site.com` qui pouvait viser un autre site ;
  - `?error=__proto__` qui faisait planter la page de connexion.

  En plus, le contenu saisi est isolé (`<bdi>`), ce qui corrige la ponctuation des noms français dans les pages arabes (vu à l'écran).

## Points reportés (relevés par la revue)
- Une adresse avec extension inconnue (`/wp-login.php`) renvoie bien une 404, mais avec la page 404 brute de Next.js au lieu de celle du site.
- Sur une page arabe, le texte français de repli (nom de produit sans traduction, badge, texte alternatif des images, coordonnées des réglages) n'est pas marqué `lang="fr"` : un lecteur d'écran le lit avec la voix arabe.
- Les images de partage (Open Graph) restent en français.
- La liste de devis garde le nom d'un produit dans la langue du moment de l'ajout : après un changement de langue, le message WhatsApp peut mélanger les deux langues.
- Bouton AR | FR : le nom lu par les lecteurs d'écran (« العربية », « Français ») ne contient pas le texte visible (« AR », « FR »).
- En arabe, le logo de l'en-tête rétrécit depuis la gauche au défilement.
- Pas de test automatique du `proxy.ts` lui-même ni du repli « sans colonnes arabes » dans les actions ; leurs fonctions pures sont testées.
- Deux commentaires de code périmés (`lib/i18n/index.ts`, fiche produit).

## Dépendances ajoutées
Aucune.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
