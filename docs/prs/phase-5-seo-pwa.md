# feat: Phase 5 — SEO, PWA et préparation des évolutions

## Objectif
Être trouvé sur Google avec l'adresse **saqia.site**, pouvoir installer le site sur le téléphone, et préparer les évolutions prévues sans les publier.

Conception : `docs/superpowers/specs/2026-11-21-seo-pwa-i18n-design.md`
Plan : `docs/superpowers/plans/2026-11-21-seo-pwa-i18n.md`

## Changements
- **Adresse** : `https://saqia.site` par défaut, toujours pilotée par `NEXT_PUBLIC_SITE_URL`. Elle remplace `saqia.com`, jamais confirmée.
- **Métadonnées par page** : titre, description, lien canonique, aperçu de partage (Open Graph `fr_MA`) et carte Twitter.
  - Les vues filtrées du catalogue pointent vers `/produits`.
- **`/sitemap.xml`** : accueil, catalogue, contact et les 25 produits publiés.
- **`/robots.txt`** : `/admin`, `/brand`, `/design` et les pages de recherche du catalogue sont exclus.
- **Données structurées (JSON-LD)** : entreprise sur l'accueil ; produit et fil d'Ariane sur les fiches ; fil d'Ariane sur le catalogue.
  - Rien d'inventé : aucun prix, aucun avis, aucune note.
  - Une photo provisoire n'est pas présentée comme photo du produit.
- **Image de partage par produit** (WhatsApp, Facebook) : photo, nom, gamme et logo.
- **Application installable** : manifeste aux couleurs de la marque et icônes existantes.
  - Service worker minimal : seule la page « Vous êtes hors ligne » est mise en cache. C'est une page autonome, sans fichier externe, qui reste donc valable après chaque déploiement. Les autres pages viennent toujours du réseau : jamais de version périmée après une mise à jour.
- **Préparé, non publié** (voir `docs/evolutions.md`) :
  - **arabe** : dictionnaires fr/ar et sens de lecture ; textes arabes **à faire relire** par un locuteur natif ;
  - **WhatsApp par région** : choix du numéro selon la région, testé, à partir des réglages de l'admin ;
  - **calculateur de pompe, fiches conseils, suivi de l'entonnoir** : types et emplacements.

## Mettre le site en ligne sur saqia.site
1. **Vercel → Settings → Domains** : ajoutez `saqia.site` et `www.saqia.site`.
2. **Namecheap → Domain List → Manage → Advanced DNS** :
   - supprimez les enregistrements de parking ;
   - ajoutez ceux que Vercel affiche (en général un **A** `@` → `76.76.21.21` et un **CNAME** `www` → `cname.vercel-dns.com`).

   Recopiez les valeurs exactes de Vercel.
3. **Vercel → Settings → Environment Variables** (Production) : `NEXT_PUBLIC_SITE_URL` = `https://saqia.site`, puis redéployez.
4. **Google Search Console** :
   - ajoutez la propriété de domaine `saqia.site` ;
   - vérifiez-la avec l'enregistrement **TXT** proposé (à ajouter dans Namecheap) ;
   - soumettez `https://saqia.site/sitemap.xml`.
5. **Important** : renseignez dans l'admin (**Réglages**) le vrai numéro WhatsApp, le téléphone, l'e-mail et l'adresse.
   - Tant qu'ils gardent leur valeur provisoire, ils ne sont **pas** publiés dans les données lues par Google : ce serait inventé.
   - Une fois renseignés, ils y apparaissent automatiquement.
6. **Search Console** affichera des avertissements « Produit » (pas de prix ni d'avis). C'est voulu : aucun prix n'est publié sur le site, et rien n'est inventé.

## Mesures (Lighthouse local)
| Page | SEO | Bonnes pratiques | Accessibilité |
|---|---|---|---|
| Accueil | 100 | 100 | 100 |
| Catalogue | 100 | 100 | 98 |
| Fiche produit | 100 | 100 | 100 |
| Contact | 100 | 100 | 100 |

La Performance reste dans la même plage qu'aux phases 4 et 4bis. La mesure locale n'est pas fiable sur ce PC ; la référence est PageSpeed Insights sur saqia.site.

## Checklist
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [x] `npm test` : 140 tests, dont :
  - URL absolues ;
  - métadonnées ;
  - plan du site ;
  - JSON-LD (aucune offre ni avis, échappement de `</script>`, photo provisoire non exposée) ;
  - dictionnaires fr/ar ;
  - WhatsApp par région.
- [x] E2E (build de production) :
  - manifeste servi ;
  - service worker actif ;
  - contenu à jour en ligne ;
  - page « hors ligne » sans réseau ;
  - JSON-LD présent et valide ;
  - description et canonique du catalogue dans `<head>` ;
  - images de partage (général, catalogue, contact, fiche) ;
  - page hors ligne autonome ;
  - aucune erreur JavaScript.
- [x] E2E des phases 4 et 4bis repassés : liste de devis, enregistrement des clics, filtres, animations.
- [x] Lighthouse SEO 100 sur les 4 pages
- [x] Revue de code de toute la branche : aucun point critique. 5 points corrigés, chacun avec un test qui échouait avant la correction :
  - image de partage absente du catalogue et du contact ;
  - logo de l'entreprise bloqué par `robots.txt` ;
  - coordonnées provisoires publiées comme des faits ;
  - page hors ligne sans styles une fois réellement hors ligne ;
  - chemin d'image pouvant sortir du dossier `public/`.
- [ ] Après la mise en ligne : PageSpeed Insights et Search Console sur saqia.site

## Points mineurs reportés (relevés par la revue)
- Pas de délai maximal pour télécharger une photo distante dans l'image de partage.
- Les recherches (`?q=`) sont exclues par `robots.txt` : une page déjà connue de Google pourrait rester listée sans contenu un moment.
- Une adresse `NEXT_PUBLIC_SITE_URL` sans `https://` retombe sur saqia.site sans avertissement.
- Le préchargement des navigations par le service worker n'est pas activé.
- Petits nettoyages : import en double dans la page contact ; ligne `Host` de `robots.txt` (ignorée par Google).

## Dépendances ajoutées
Aucune. L'image de partage convertit la photo WebP en PNG avec `sharp`, déjà installé avec Next.

## Migrations SQL
Aucune.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
