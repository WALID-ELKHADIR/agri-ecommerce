# Phase 5 — SEO, PWA et préparation des évolutions (`feat/seo-pwa-i18n`) : conception

Approuvée par le propriétaire le 21/11/2026. Domaine acheté : **saqia.site**.

## Intention
Être trouvé sur Google, être installable sur le téléphone, et préparer les évolutions prévues (arabe, calculateur, conseils, WhatsApp par région, suivi des conversions) sans encore les publier.

## Objectifs
- **Adresse de référence** : `NEXT_PUBLIC_SITE_URL`, avec `https://saqia.site` par défaut. Elle remplace `https://saqia.com`, jamais confirmée.
- **Métadonnées par page** : titre, description, lien canonique, Open Graph (`fr_MA`, nom du site), carte Twitter.
  - Catalogue filtré : canonique vers `/produits`.
  - Recherche (`?q=`) : `noindex, follow`.
- **`app/sitemap.ts`** : `/`, `/produits`, `/contact` et chaque produit publié. `/brand`, `/design` et `/admin` en sont absents.
- **`app/robots.ts`** : autorise le site, bloque `/admin`, `/brand` et `/design`, et indique l'adresse du plan du site.
- **JSON-LD** :
  - `Organization` sur l'accueil : nom, url, logo, téléphone, zone desservie Maroc ;
  - `Product` sur la fiche : nom, image, description, catégorie, url ;
  - `BreadcrumbList` sur le catalogue et la fiche.
- **Image de partage par produit** : `app/produits/[slug]/opengraph-image.tsx`, avec la photo, le nom et le logo.
- **`app/manifest.ts`** :
  - nom, nom court, `start_url` `/`, `display` `standalone` ;
  - couleurs de la marque ;
  - icônes existantes, `lang` `fr`.
- **Page `/hors-ligne`** et service worker minimal `public/sw.js` :
  - réseau d'abord pour les navigations, repli sur `/hors-ligne` mise en cache à l'installation ;
  - rien d'autre n'est mis en cache ;
  - enregistré en production seulement.
- **Arabe (structure)** :
  - `lib/i18n/{fr,ar,index}.ts` : dictionnaires, `getDictionary`, `direction(locale)` ;
  - `<html lang dir>` piloté par la langue par défaut (fr) ;
  - messages WhatsApp localisables ;
  - textes arabes marqués « à faire relire ».
- **WhatsApp par région** : `resolveWhatsappNumber(settings, region)`, pure et testée, sans branchement dans l'interface.
- **Calculateur, conseils, suivi de l'entonnoir** : types et emplacements documentés dans `docs/evolutions.md`, sans page publiée.

## Non-objectifs
- Routes `/ar/…` publiques, bascule de langue visible.
- Prix ou avis dans les données structurées.
- Mise en cache hors ligne du catalogue.

## Anti-objectifs (échec même si « ça marche »)
- **Un fait inventé** dans les métadonnées ou le JSON-LD : prix, avis, note, stock chiffré.
- **Un service worker qui sert une page périmée** ou bloque une mise à jour.
- **Des pages internes indexées** : `/brand`, `/design`, `/admin`.
- **Un score Lighthouse SEO sous 100.**

## Contraintes
- Next.js 16.4 : conventions de fichiers de métadonnées (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/`). Pas de `Date.now()` dans un rendu pré-calculé.
- Aucune dépendance. TypeScript strict. Textes en français.

## Approches
- **Retenue** : les conventions natives de Next pour sitemap, robots, manifest et images OG ; du JSON-LD écrit par des fonctions pures et testées ; un service worker écrit à la main, minimal.
- **Écartées** :
  - `next-pwa` / Workbox : dépendance, et une mise en cache trop agressive pour ce besoin ;
  - `next-intl` : dépendance pour une structure qui n'est pas encore publiée.
