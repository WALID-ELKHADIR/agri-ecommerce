# chore: Phase 0 — assainissement

## Objectif
Rendre la base saine avant la refonte Saqia : build qui passe, textes correctement encodés, coordonnées configurables, documentation à jour.

## Changements
- **Build réparé** : import `getCatalog` manquant dans la fiche produit (le build échouait sur l'état sauvegardé).
- **Build sans Supabase** : `lib/supabase/server.ts` lit les cookies avant de vérifier la configuration. Sans variables Supabase, la vitrine répond (200) et l'admin redirige vers `/admin/login?error=config` au lieu de faire échouer le build.
- **Encodage** : 67 lignes corrigées dans `lib/catalog.ts` (accents, tirets, « », emoji 👋). Un test bloque toute réapparition.
- **Coordonnées en variables d'env** (`lib/site-config.ts`) : WhatsApp, téléphone, e-mail, adresse, horaires, URL du site.
  - Le numéro accepte `+212 6…`, `00212 6…`, `(0)` et `06…`.
  - Il revient à une valeur de repli s'il est invalide, avec un avertissement côté serveur uniquement.
- **Config** : `tailwind.config.js` (v3) supprimé. `.env.example` est maintenant suivi par Git.
- **Tests** : `npm test` (runner natif Node 22), 10 tests.
- **Docs** : README réécrit, `.env.example` commenté.
- **Outillage** : `scripts/screenshots.mjs` pour les captures mobile et desktop.

## Captures (après)
`docs/screenshots/0-assainissement/` : accueil, catalogue, fiche produit, contact, en 390×844 et 1440×900.
⚠️ Les images produits sont **cassées** : les anciennes images ont été supprimées avant cette phase, et leur remplacement est prévu en phase 2bis.

## Checklist
- [x] `npm run lint`
- [x] `npm test` (10/10)
- [x] `npm run build` (avec et sans variables Supabase)
- [x] Revue de code (corrections appliquées : formats de numéro marocains, avertissement côté serveur uniquement, note sur le redéploiement des variables)
- [ ] Lighthouse : à partir de la phase 4

## Dépendances ajoutées
- `playwright` (devDependency) : captures d'écran des PR. C'est un outil de vérification, non livré avec le site.

## Migrations SQL
Aucune.

## Écarts au plan
- Deux corrections hors plan, nécessaires pour que le build passe : l'import manquant et le build sans Supabase.
- Le motif du test d'encodage est plus large que prévu (« Â » suivi d'un octet, emoji) pour attraper tous les cas réels. Une ligne de `PLAN.md` a été reformulée parce qu'elle citait ces caractères.

## À noter
Cette PR contient aussi les 3 commits faits sur `main` en local et pas encore poussés : la sauvegarde de l'état existant, le document de conception et le plan.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
