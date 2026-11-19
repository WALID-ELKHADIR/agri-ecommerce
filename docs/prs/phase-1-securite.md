# fix: Phase 1 — sécurité de l'administration

> ⚠️ **Branche basée sur `chore/assainissement`** (Phase 0), pas encore fusionnée dans `main`. Fusionnez d'abord la PR de la Phase 0. Sinon, cette PR affichera aussi ses commits.

## Objectif
Avant, **tout compte connecté** pouvait modifier le catalogue et lire les demandes des clients. Désormais, seuls les administrateurs déclarés le peuvent, en base comme dans l'application.

## Changements
- **Migration `20261119100000_admin_rls.sql`**
  - Table `admin_users` et fonction `is_admin()` (security definer).
  - Toutes les policies d'écriture (catégories, produits) et de lecture, modification et suppression des demandes passent par `is_admin()`. Les admins voient aussi les brouillons.
  - Demandes de devis :
    - colonne `items` pour les devis multi-produits ;
    - contraintes de taille sur les champs ;
    - limite anti-spam de 3 demandes par téléphone en 10 minutes et 30 par minute au total. Pour les non-admins, `created_at` et `status` sont imposés par la base, donc impossibles à falsifier.
- **Garde admin** : `requireAdmin()`, la connexion et `proxy.ts` vérifient le rôle, pas seulement la session.
  - Un compte non-admin est déconnecté, avec le message « Ce compte n'a pas accès à l'administration. »
  - Si les droits ne peuvent pas être vérifiés (migration absente, panne), l'accès est refusé **sans déconnexion**, avec un message dédié.
- **Anti-spam des formulaires**
  - Champ piège invisible et délai minimal de 3 s, mesuré dans le navigateur. Les robots reçoivent « ok » mais rien n'est enregistré.
  - Les types sont vérifiés à l'exécution : une donnée inattendue est refusée sans erreur 500.
  - La limite atteinte en base est traduite en message clair pour le visiteur.
- **Tests**
  - `tests/rls.test.ts` exécute les migrations (deux fois, pour vérifier qu'on peut les relancer) dans un vrai Postgres en mémoire, puis vérifie les droits anonyme, non-admin et admin.
  - `scripts/check-rls.ts` fait les mêmes vérifications sur le vrai projet Supabase, avec des sondes qui ne modifient aucune donnée.
- **README** : création d'un admin, vérification des droits, ordre de déploiement des migrations.

## À faire par vous, dans cet ordre
1. **(Recommandé)** Contrôle préalable dans le *SQL Editor*. Le résultat doit être `0`, sinon la migration s'arrête sur la contrainte de quantité :
   ```sql
   select count(*) from public.quote_requests where quantity > 100000 or quantity < 1;
   ```
2. **Appliquez la migration** `supabase/migrations/20261119100000_admin_rls.sql` (*SQL Editor → Run*), **avant** de déployer ce code.
3. **Déclarez votre compte admin** :
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'votre-email';
   ```
4. **Fermez les inscriptions** : *Authentication → Sign In / Providers → Allow new users to sign up* (décocher).
5. **(Facultatif)** Créez deux comptes de test, renseignez `RLS_*` dans `.env.local`, puis lancez `node scripts/check-rls.ts`.

## Captures
`docs/screenshots/1-securite/` : page de connexion avec le message de refus, et formulaire de contact (le champ piège est invisible).

## Checklist
- [x] `npm run lint`
- [x] `npm test` : 35/35, dont 10 tests de droits sur un vrai Postgres
- [x] `npm run build`
- [x] Revue de code. Corrections appliquées :
  - contournement de la limite en antidatant `created_at` ;
  - délai anti-robot faussé par l'horloge du visiteur ;
  - déconnexion d'un admin quand `is_admin()` échoue ;
  - sondes destructrices dans `check-rls`.
- [ ] `check-rls.ts` sur le vrai projet : à lancer par vous après l'étape 2
- [ ] Lighthouse : à partir de la phase 4

## Dépendances ajoutées
- `@electric-sql/pglite` (devDependency) : un Postgres en mémoire pour tester les policies RLS à chaque `npm test`, sans projet Supabase. Non livré avec le site.

## Écarts au plan
- **Ajout du test PGlite**, en plus du script prévu : il vérifie automatiquement chaque future migration.
- **Pas de champ piège ni de délai sur le bouton WhatsApp de la fiche produit.** C'est un clic sur un lien, pas un formulaire, et un vrai visiteur peut cliquer en moins de 3 s. Ce bouton reste protégé par les limites en base.
- **Le délai est envoyé comme une durée (`elapsedMs`)** plutôt qu'une heure de début, pour ne pas dépendre de l'horloge du visiteur.

## Limites connues
- La limite globale de 30 demandes par minute peut être saturée par un robot. Dans ce cas, les demandes ne sont plus *enregistrées*, mais WhatsApp s'ouvre toujours pour le visiteur, donc le contact n'est pas perdu.
- Les comptages anti-spam ne posent pas de verrou : deux envois strictement simultanés peuvent dépasser la limite d'une unité.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
