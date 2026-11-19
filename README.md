# AgriFlow — catalogue d'irrigation et de pompage

> Le site devient **Saqia** en phase 1bis de la refonte (voir `docs/plans/PLAN.md`).

Catalogue agricole mobile-first (pompes, raccords, kits d'irrigation, Maroc). Il n'y a ni panier ni paiement en ligne : **chaque demande se fait sur WhatsApp**, et chaque clic est aussi enregistré comme demande de devis dans Supabase, ce qui sert de mini-CRM dans l'espace admin.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, `proxy.ts`), React 19
- Tailwind CSS 4 (configuration dans `app/globals.css`, pas de `tailwind.config.js`)
- [Supabase](https://supabase.com) : Postgres + RLS, authentification de l'admin
- Hébergement : Vercel Hobby + Supabase Free (0 €)

## Installation

Prérequis : Node.js 22 ou plus récent, npm.

```bash
npm ci
cp .env.example .env.local   # puis remplissez les valeurs
npm run dev                  # http://localhost:3000
```

Sans Supabase configuré, la vitrine fonctionne quand même avec le catalogue de secours (`lib/catalog.ts`). L'admin, lui, a besoin de Supabase.

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` / `npm start` | build et serveur de production |
| `npm run lint` | ESLint |
| `npm test` | tests unitaires (`node --test`, dossier `tests/`) |

## Variables d'environnement

Elles sont toutes décrites dans [`.env.example`](.env.example).

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | connexion à Supabase |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | numéro qui reçoit les demandes (normalisé automatiquement ; un numéro de repli est utilisé s'il est invalide) |
| `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_ADDRESS`, `NEXT_PUBLIC_HOURS` | coordonnées affichées |
| `NEXT_PUBLIC_SITE_URL` | URL publique (métadonnées, sitemap) |

Chaque variable a une valeur de repli dans `lib/site-config.ts`. Le numéro WhatsApp accepte les formats `+212 6…`, `00212 6…` et `06…`.

> ⚠️ Les variables `NEXT_PUBLIC_*` sont intégrées au site **au moment du build**. Après les avoir modifiées sur Vercel, relancez un déploiement (*Deployments → Redeploy*) pour qu'elles s'appliquent.

## Base de données Supabase

Les migrations sont dans `supabase/migrations/` et s'appliquent **dans l'ordre des noms de fichiers**. Pour chacune : Supabase → *SQL Editor* → coller le fichier → *Run*. Elles sont écrites pour pouvoir être relancées sans effet de bord.

Règle du projet : une migration déjà appliquée n'est jamais modifiée. Tout changement passe par une nouvelle migration.

## Créer un administrateur

Seuls les comptes listés dans la table `admin_users` accèdent à l'admin. Un compte connecté qui n'y figure pas est déconnecté automatiquement, et la base refuse aussi ses écritures (RLS).

1. **Fermez les inscriptions publiques** : Supabase → *Authentication → Sign In / Providers* → décochez *Allow new users to sign up*.
2. **Créez le compte** : *Authentication → Users → Add user → Create new user* (e-mail + mot de passe, cochez *Auto Confirm User*).
3. **Déclarez-le administrateur** dans le *SQL Editor* :
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'vous@exemple.ma';
   ```
4. **Retirer un administrateur** : `delete from public.admin_users where user_id = '<uuid>';`

### Vérifier les droits

- `npm test` vérifie automatiquement les policies dans une base Postgres en mémoire (PGlite), sans Supabase.
- Sur votre vrai projet, après chaque migration : créez deux comptes **de test** (un admin, un simple utilisateur), renseignez `RLS_*` dans `.env.local`, puis lancez :
  ```bash
  node scripts/check-rls.ts
  ```
  Chaque ligne doit afficher ✅. Le script supprime les demandes de test qu'il crée.

### Protection anti-spam des demandes

- Le formulaire de contact contient un champ piège invisible et refuse les envois en moins de 3 secondes. Ces demandes reçoivent une réponse positive mais ne sont pas enregistrées.
- La base limite à 3 demandes par téléphone en 10 minutes, et à 30 demandes par minute au total.

## Déploiement (Vercel)

1. Importez le dépôt GitHub dans Vercel (framework détecté automatiquement).
2. Renseignez les variables d'environnement de `.env.example` (*Settings → Environment Variables*).
3. Chaque push crée un déploiement de prévisualisation ; `main` est déployé en production.

## Workflow Git

- Une branche par phase, créée depuis `main` à jour : `chore/…`, `fix/…`, `feat/…`.
- Commits atomiques au format [Conventional Commits](https://www.conventionalcommits.org/fr/), en français : `fix(catalog): corrige l'encodage UTF-8 des textes produits`.
- Chaque branche fait l'objet d'une Pull Request vers `main` (objectif, changements, captures, checklist, migrations à appliquer). Pas de push forcé sur `main`.

Le plan complet de la refonte est dans [`docs/plans/PLAN.md`](docs/plans/PLAN.md).
