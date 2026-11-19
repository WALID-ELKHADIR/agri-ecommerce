# Refonte Saqia — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** transformer AgriFlow en Saqia — vitrine mobile-first premium qui convertit via WhatsApp, back-office admin sécurisé — en 9 phases, une branche et une PR chacune.

**Architecture :** Next.js 16 App Router (RSC par défaut, Server Actions, `proxy.ts`), Supabase (Postgres + RLS + Storage) comme source de vérité du catalogue, `lib/catalog.ts` comme simple repli. Les droits admin reposent sur une table `admin_users` et une fonction SQL `is_admin()`, vérifiées à la fois en base (RLS) et côté serveur (`requireAdmin`, `proxy.ts`).

**Tech Stack :** Next.js 16.4, React 19.3, Tailwind CSS 4.3 (CSS-first), `@supabase/ssr`, TypeScript strict, `node --test` (Node 22, type stripping natif) pour les tests unitaires, `sharp` (déjà présent) pour les images.

**Spec :** `docs/superpowers/specs/2026-11-19-saqia-refonte-design.md` + brief `PROMPT-CLAUDE-CODE-SAQIA.md` (référence pour tout ce que la spec ne modifie pas).

**Niveau de détail :** les phases 0 et 1 sont découpées en tâches prêtes à exécuter. Les phases suivantes ont leur branche, leur périmètre, leurs fichiers et leurs critères d'acceptation. Elles seront détaillées en tâches **au démarrage de chaque phase**, car elles dépendent de choix du propriétaire encore à venir (logo, inventaire photos, catégories).

## Global Constraints

- Lire `AGENTS.md` et le guide concerné dans `node_modules/next/dist/docs/` avant toute API Next (proxy, cache, metadata, images…).
- TypeScript strict : aucun `any`, aucun `@ts-ignore`. Textes UI en français, vouvoiement.
- Budget 0 € : Vercel Hobby + Supabase Free. Aucune dépendance sans justification d'une ligne dans la PR. Pas de librairie UI lourde.
- Ne jamais modifier `supabase/migrations/20261118000000_init.sql`. Nouvelles migrations datées `YYYYMMDDHHMMSS_nom.sql`, commentées, idempotentes.
- Le propriétaire applique le SQL lui-même (éditeur SQL Supabase). Chaque PR qui touche la base liste les migrations à appliquer, dans l'ordre.
- Aucun secret commité (`.env.local` reste ignoré). Aucune mention de « Moyza » dans le code, les métadonnées ou les visuels.
- Aucune caractéristique produit inventée, aucun faux avis.
- Une branche par phase depuis `main` à jour. Commits atomiques en Conventional Commits français, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Jamais de merge ni de `push --force` sur `main`.
- `gh` absent : après `git push -u origin <branche>`, fournir le lien `https://github.com/WALID-ELKHADIR/agri-ecommerce/compare/main...<branche>?expand=1` et le texte de la PR.
- Fin de phase : `npm run lint`, `npm test`, `npm run build` sans erreur ; captures 390×844 et 1440×900 des pages modifiées dans `docs/screenshots/<phase>/` via `scripts/screenshots.mjs` (Playwright en devDependency, justifiée : outil de vérification non livré) ; Lighthouse mobile mesuré en local (`next build && next start`) à partir de la phase 4.

## Review Focus

1. **Utilisateur connecté mais non-admin** qui ouvre `/admin/*` ou appelle une Server Action admin directement → il est déconnecté, redirigé vers `/admin/login?error=forbidden`, et la base refuse aussi l'écriture (RLS). Testé en Task 1.3 (`resolveAdminAccess`) et en Task 1.2 (`check-rls`).
2. **Numéro WhatsApp mal saisi dans l'env** (`+212 6 12-34-56-78`, vide, lettres) → normalisé en chiffres seuls, ou valeur de repli avec avertissement. Le lien `wa.me` n'est jamais cassé. Testé en Task 0.3.
3. **Bot qui remplit le formulaire** (champ piège rempli, envoi en moins de 3 s, rafale depuis le même téléphone) → réponse « ok » côté client mais aucune insertion, et la base refuse au-delà de la limite. Testé en Tasks 1.1 et 1.4.
4. **Supabase injoignable ou non configuré** → la vitrine s'affiche depuis le repli, sans erreur 500. Couvert par le comportement existant de `lib/catalog-data.ts`, vérifié manuellement en fin de Phase 0 avec un `.env.local` vide.
5. **Accents, guillemets et caractères spéciaux dans le message WhatsApp** (`Pompe immergée 4" — 90°`) → correctement encodés, et le texte décodé est identique. Testé en Task 0.3.

---

## Phase 0 — Assainissement · branche `chore/assainissement`

### Task 0.1 : Branche, outillage de test et nettoyage de config

**Files :**
- Modify : `.gitignore` (ajouter `!.env.example` après `.env*`)
- Delete : `tailwind.config.js`
- Modify : `package.json` (`"test": "node --test \"tests/**/*.test.ts\""`)
- Modify : `tsconfig.json` (`"allowImportingTsExtensions": true` — les tests importent `../lib/x.ts`)
- Create : `tests/smoke.test.ts`

- [ ] `git checkout main && git pull && git checkout -b chore/assainissement`
- [ ] Écrire `tests/smoke.test.ts` : `test("le runner fonctionne", () => assert.equal(1 + 1, 2))`.
- [ ] Run `npm test` → Expected : `# pass 1`.
- [ ] Supprimer `tailwind.config.js`. Vérifier que `postcss.config.js` ne contient que `@tailwindcss/postcss`. Run `npm run build` → succès, styles inchangés (contrôle visuel de `/`).
- [ ] Commit `chore(config): supprime tailwind.config.js hérité de la v3 et ajoute le runner de tests`.

### Task 0.2 : Correction de l'encodage

**Files :**
- Modify : `lib/catalog.ts` (65 lignes mojibake)
- Create : `tests/encoding.test.ts`

- [ ] Écrire `tests/encoding.test.ts` : il parcourt `app/`, `components/`, `lib/`, `supabase/`, `docs/`, `README.md` (extensions `.ts .tsx .css .sql .md .json`) et vérifie qu'aucun fichier ne contient `Ã` ni `â€`. Le message d'échec liste `fichier:ligne`.
- [ ] Run `npm test` → Expected : FAIL qui liste les lignes de `lib/catalog.ts`.
- [ ] Ré-encoder `lib/catalog.ts` (décodage latin-1 → UTF-8 des séquences fautives, puis relecture manuelle des 65 lignes : `é è à â ° — – · " ’`).
- [ ] Run `npm test` → PASS. Run `npm run build` → succès.
- [ ] Commit `fix(catalog): corrige l'encodage UTF-8 des textes produits`.

### Task 0.3 : Coordonnées en variables d'environnement

**Files :**
- Create : `lib/site-config.ts`
- Modify : `lib/catalog.ts` (`BRAND`, `WHATSAPP_NUMBER` et le constructeur de lien `wa.me` lisent `siteConfig`)
- Test : `tests/site-config.test.ts`

**Interfaces :**
- Produces : `type SiteConfig = { name: string; tagline: string; whatsappNumber: string; phoneDisplay: string; phoneRaw: string; email: string; address: string; hours: string; siteUrl: string }`
- Produces : `readSiteConfig(env: Partial<Record<SiteEnvKey, string | undefined>>): SiteConfig` (pure, testable)
- Produces : `siteConfig: SiteConfig` — construit en lisant **chaque** `process.env.NEXT_PUBLIC_*` littéralement (indispensable pour l'inlining côté client)
- Produces : `whatsappUrl(message: string, number?: string): string`
- Variables : `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_ADDRESS`, `NEXT_PUBLIC_HOURS`, `NEXT_PUBLIC_SITE_URL`

- [ ] Écrire les tests :
  - `readSiteConfig({ NEXT_PUBLIC_WHATSAPP_NUMBER: "+212 6 12-34-56-78" }).whatsappNumber === "212612345678"`
  - valeur vide ou `"abc"` → repli `"212600000000"`
  - longueur hors 8–15 chiffres → repli
  - `NEXT_PUBLIC_SITE_URL` `"https://x.ma/"` → `"https://x.ma"` (sans slash final) ; invalide → repli
  - `phoneDisplay` dérivé de `NEXT_PUBLIC_PHONE` quand fourni
  - `decodeURIComponent(new URL(whatsappUrl('Pompe immergée 4" — 90°')).searchParams.get("text")!) === 'Pompe immergée 4" — 90°'`
- [ ] Run `npm test` → FAIL (`readSiteConfig` introuvable).
- [ ] Implémenter `lib/site-config.ts`. Les replis gardent les valeurs actuelles (nom « AgriFlow » jusqu'à la Phase 1bis).
- [ ] Brancher `lib/catalog.ts` dessus. Supprimer la constante en dur `212600000000` hors des replis.
- [ ] Run `npm test` → PASS ; `npm run build` → succès ; `grep -rn "212600000000" app components lib` → seulement `lib/site-config.ts`.
- [ ] Commit `refactor(config): déplace les coordonnées et le numéro WhatsApp dans les variables d'environnement`.

### Task 0.4 : `.env.example` et README

**Files :**
- Create : `.env.example` (toutes les variables de Task 0.3 + `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, chacune commentée, valeurs factices)
- Modify : `README.md` (réécriture complète)

- [ ] README, sections : présentation, prérequis, installation (`npm ci`), variables d'env, migrations Supabase (ordre, application via l'éditeur SQL), création d'un admin (renvoi vers la Phase 1), déploiement Vercel, workflow Git (branches, commits, PR).
- [ ] `git check-ignore .env.example` → aucune sortie (fichier suivi). `git check-ignore .env.local` → ignoré.
- [ ] Commit `docs: réécrit le README et ajoute .env.example`.

### Fin de Phase 0

- [ ] Vérification « Supabase absent » : renommer temporairement `.env.local`, `npm run build && npm start`, `/` et `/produits` s'affichent depuis le repli. Puis restaurer.
- [ ] Créer `scripts/screenshots.mjs` (Playwright, devDependency) : `node scripts/screenshots.mjs <phase> <url...>` → `docs/screenshots/<phase>/<page>-mobile.png` (390×844) et `-desktop.png` (1440×900). Captures de `/`, `/produits`, une fiche, `/contact`. Commit `chore(tooling): ajoute le script de captures Playwright`.
- [ ] lint + test + build verts → superpowers:requesting-code-review → push → lien PR.
- Note : les images produits restent cassées tant que la Phase 2bis n'est pas faite. C'est signalé dans la PR.

---

## Phase 1 — Sécurité · branche `fix/securite-admin-rls`

### Task 1.1 : Migration admin + RLS + durcissement des demandes

**Files :**
- Create : `supabase/migrations/20261119100000_admin_rls.sql`

Contenu (commenté, idempotent : `create … if not exists`, `drop policy if exists` avant `create policy`) :
- `public.admin_users (user_id uuid primary key references auth.users on delete cascade, created_at timestamptz not null default now())`, RLS activée, aucune policy pour `anon`/`authenticated` (lecture via `is_admin()` uniquement).
- `public.is_admin() returns boolean language sql security definer stable set search_path = public` → `exists (select 1 from admin_users where user_id = auth.uid())`. `grant execute … to anon, authenticated`.
- Remplacer les policies `categories admin write`, `products admin write`, `quotes admin read/update/delete` par des versions `using (public.is_admin()) with check (public.is_admin())`. Ajouter `products admin read all` (les admins voient les brouillons). Lecture publique inchangée.
- `quote_requests` : `add column if not exists items jsonb` + CHECK (`items is null or (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50)`). CHECK de longueur : `name ≤ 120`, `phone ≤ 40`, `email ≤ 160`, `profile ≤ 120`, `product_slug ≤ 160`, `message ≤ 2000`, `source ≤ 40`, `quantity between 1 and 100000`. Ajouter les contraintes `not valid`, puis `validate` (aucune ligne existante n'est réécrite).
- Anti-spam : fonction `security definer` + trigger `before insert` qui lève une exception si ≥ 3 demandes avec le même `phone` dans les 10 dernières minutes, ou ≥ 30 demandes au total dans la dernière minute.

- [ ] Écrire le SQL. Le relire contre les policies existantes (`grep -n "create policy" supabase/migrations/*.sql`) : chaque policy d'écriture est remplacée.
- [ ] Commit `fix(security): restreint l'écriture RLS aux administrateurs via is_admin()`.

### Task 1.2 : Script de vérification RLS

**Files :**
- Create : `scripts/check-rls.ts` (exécuté avec `node scripts/check-rls.ts`, charge `.env.local` via `process.loadEnvFile`)
- Modify : `.env.example` (ajouter `RLS_ADMIN_EMAIL`, `RLS_ADMIN_PASSWORD`, `RLS_USER_EMAIL`, `RLS_USER_PASSWORD` — **comptes de test**, commentés)

Assertions affichées en ✅ / ❌, code de sortie 1 au premier échec :
- anon : lit les catégories et les produits publiés ; ne lit **aucune** demande ; insère une demande valide ; une 4ᵉ demande du même téléphone en < 10 min est refusée ; ne peut pas modifier un produit.
- non-admin connecté : `rpc("is_admin")` → `false` ; update produit → 0 ligne ; select `quote_requests` → 0 ligne.
- admin : `rpc("is_admin")` → `true` ; lit les demandes ; met à jour puis restaure `position` d'un produit (aucune donnée modifiée au final).
- Le script supprime les demandes de test qu'il a créées (marquées `source = "rls-check"`) avec le compte admin.

- [ ] Run sans variables → message clair « renseignez RLS_* dans .env.local », code 1.
- [ ] Commit `test(security): ajoute un script de vérification des policies RLS`.
- [ ] Si les comptes de test sont disponibles : lancer le script après application de la migration par le propriétaire → tout ✅. Sinon, l'indiquer dans la PR comme étape à faire par le propriétaire.

### Task 1.3 : Garde admin côté serveur et proxy

**Files :**
- Create : `lib/admin-access.ts` (pur, sans import serveur)
- Modify : `lib/auth.ts`, `proxy.ts`, `app/admin/login/page.tsx` (message `error=forbidden`)
- Test : `tests/admin-access.test.ts`

**Interfaces :**
- Produces : `resolveAdminAccess(s: { hasUser: boolean; isAdmin: boolean; isLoginPage: boolean }): "allow" | "redirect-login" | "signout-forbidden" | "redirect-admin"`
- Produces : `requireAdmin(): Promise<User>` (même signature qu'aujourd'hui ; appelle `rpc("is_admin")`. Si non-admin : `signOut()` puis `redirect("/admin/login?error=forbidden")`)

- [ ] Tests : pas d'utilisateur hors login → `redirect-login` ; pas d'utilisateur sur login → `allow` ; utilisateur non-admin (login ou non) → `signout-forbidden` ; admin sur login → `redirect-admin` ; admin ailleurs → `allow`.
- [ ] Run → FAIL ; implémenter ; Run → PASS.
- [ ] Brancher `proxy.ts` (cas `signout-forbidden` : `supabase.auth.signOut()` puis redirection, cookies de réponse conservés) et `requireAdmin`. Vérifier que chaque Server Action de `lib/actions/products.ts` et `lib/actions/quotes.ts` appelle `requireAdmin()` (`grep -c requireAdmin`).
- [ ] Page login : `?error=forbidden` → « Ce compte n'a pas accès à l'administration. »
- [ ] Commit `fix(security): vérifie le rôle admin dans requireAdmin et proxy.ts`.

### Task 1.4 : Formulaires anti-spam

**Files :**
- Create : `lib/quote-validation.ts`
- Modify : `lib/actions/quotes.ts` (`saveQuoteRequest` utilise la validation), `components/quote-form.tsx`, `components/product-quote.tsx` (champ piège `website` masqué — `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"` — et `startedAt` horodaté au montage)
- Test : `tests/quote-validation.test.ts`

**Interfaces :**
- Produces : `validateQuoteInput(input: QuoteRequestInput & { website?: string; startedAt?: number }, now: number): { ok: true; data: QuoteInsert } | { ok: false; reason: "empty" | "spam" | "invalid" }`
- `QuoteRequestInput` gagne `items?: { slug: string; name: string; quantity: number }[]`

- [ ] Tests : `website` non vide → `spam` ; `now - startedAt < 3000` → `spam` ; tout vide → `empty` ; textes tronqués aux limites de la Task 1.1 ; `quantity` 0 / négative / > 100000 → `null` ; `items` de plus de 50 éléments → `invalid`.
- [ ] Run → FAIL ; implémenter ; Run → PASS.
- [ ] Dans `saveQuoteRequest` : en cas de `spam`, renvoyer `{ ok: true }` **sans insérer**. Une erreur de limite levée par la base → `{ ok: false, reason: "rate-limited" }` avec le message « Trop de demandes, réessayez dans quelques minutes ou écrivez-nous sur WhatsApp. »
- [ ] Commit `fix(security): ajoute un champ piège et une validation anti-spam aux demandes de devis`.

### Task 1.5 : Documentation admin

- [ ] README, section « Créer un administrateur » : désactiver les inscriptions (Supabase → Authentication → Sign In / Providers → décocher *Allow new users to sign up*), créer l'utilisateur, `insert into public.admin_users (user_id) values ('<uuid>');`, lancer `node scripts/check-rls.ts`.
- [ ] Commit `docs(security): documente la création d'un administrateur`.
- [ ] Fin de phase (lint, test, build, captures de `/admin/login`, revue, push, lien PR avec la migration à appliquer).

---

## Phases suivantes (à détailler en tâches au démarrage)

### Phase 1bis — Marque & logo · `feat/brand-saqia`
- **Fichiers** : `lib/site-config.ts` (repli `name: "Saqia"`, slogan, `contact@saqia.com`, `https://saqia.com`), `app/layout.tsx` + metadata des pages, `app/(internal)/brand/page.tsx` (noindex), `components/brand/logo.tsx` (remplace `components/logo.tsx`), `public/brand/*`, `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico`, `app/opengraph-image.tsx`, `docs/brand.md`, `package.json` (`"name": "saqia"`). La **police display est choisie ici** (cf. spec §9) et chargée via `next/font`.
- **Point d'arrêt** : 3 pistes de logo sur `/brand` → choix du propriétaire avant les déclinaisons.
- **Acceptation** : `grep -ri agriflow` → 0 (hors `_archive/`, migration init) ; logo lisible à 16 px ; aucun vert WhatsApp dans le logo ; aucune URL de domaine en dur.

### Phase 2 — Design system · `feat/design-system`
- **Fichiers** : `app/globals.css` (`@theme` : palettes field/water/harvest/soil/whatsapp, rayons, ombres, `--ease-out-expo`, durées 150/250/400/700 ms, échelle `clamp()`), `components/ui/*` (Button, Badge, Input, Select, Textarea, Sheet, Dialog, Skeleton, Toast, EmptyState, SectionHeading, Container), tous les composants qui utilisent des hex en dur.
- **Acceptation** : `grep -rnE "\[#[0-9a-fA-F]{3,6}\]" app components` → 0 ; contraste AA ; focus visible ; cibles ≥ 44 px ; `prefers-reduced-motion` respecté.

### Phase 2bis — Images produits · `feat/images-produits`
- **Point d'arrêt 1** : tableau d'inventaire `photo → produit proposé → catégorie → rôle (principale / galerie / rejet) → qualité` + nouvelles catégories proposées → validation du propriétaire.
- **Fichiers** : `public/images/_archive/` (originaux), `public/images/products/<slug>/main.webp` (détouré, fond #faf8f3, 1200², < 150 Ko) et `gallery-N.webp` (recadré sans logo Moyza), `public/images/{hero,categories,sections,og}/` (photos libres de droits, licence notée), `lib/images-manifest.ts` (`source: "photo" | "stock" | "placeholder"`, `blurDataURL`, crédit), `scripts/process-images.ts` (sharp), `scripts/sync-images.ts` (`--dry-run` par défaut), migration seed des nouveaux produits/catégories, `lib/catalog.ts` généré depuis le manifest, `docs/images-contact-sheet.png`.
- **Point d'arrêt 2** : le propriétaire valide la planche contact (aucune trace Moyza).
- **Acceptation** : avertissement au build si un produit n'a pas d'entrée dans le manifest ; specs des nouveaux produits vides et listées « à compléter ».

### Phase 3 — Admin complet · `feat/admin-complet`
- **Migrations** : `product_images` (cf. spec §7), bucket Storage `product-images` (lecture publique, écriture `is_admin()`), table `settings` (numéros WhatsApp, coordonnées).
- **Fichiers** : `app/admin/(dashboard)/categories/*`, `…/produits/*` (recherche, filtres, tri, actions rapides), `…/demandes/*` (liste + kanban, export CSV, bouton WhatsApp, lecture de `items`), `…/reglages/*`, `components/admin/image-uploader.tsx` (glisser-déposer, recadrage 1:1, WebP via canvas, max 1600 px, réordonnable), `next.config.ts` (`images.remotePatterns` Supabase), KPIs SVG du tableau de bord.
- **Acceptation** : suppression d'une catégorie bloquée si elle contient des produits ; retirer une image supprime le fichier Storage ; états chargement / erreur / vide partout.

### Phase 4 — Vitrine mobile · `feat/vitrine-mobile`
- **Fichiers** : `components/home-page.tsx` et ses sections, `app/produits/page.tsx` (filtres searchParams, Sheet mobile), `app/produits/[slug]/page.tsx` (galerie swipe + zoom, barre WhatsApp sticky), `lib/whatsapp.ts` (message multi-produits FR, routage par région préparé), `components/quote-list/*` (liste de devis, stockage local dans un try/catch, enregistrement avec `items`), cartes produits.
- **Acceptation** : Lighthouse mobile ≥ 95 sur les 4 axes, LCP < 2,5 s, CLS < 0,05 ; `next/image` avec `sizes` exacts partout ; `priority` uniquement sur l'image LCP ; aucun faux témoignage.

### Phase 4bis — Animations · `feat/animations-ui`
- **Fichiers** : `app/globals.css` (scroll-driven `animation-timeline: view()`), `lib/hooks/use-reveal.ts` (repli IntersectionObserver), cartes, header compact, View Transitions catalogue → fiche, pulsation WhatsApp toutes les ~8 s, tracé animé du logo dans le hero.
- **Acceptation** : uniquement `transform` / `opacity` ; aucune régression Lighthouse ; tout désactivé avec `prefers-reduced-motion` ; GIF dans la PR.

### Phase 5 — SEO / PWA / i18n · `feat/seo-pwa-i18n`
- **Fichiers** : `generateMetadata` par page, `app/sitemap.ts`, `app/robots.ts`, JSON-LD (Product, Organization, BreadcrumbList), `app/produits/[slug]/opengraph-image.tsx`, `app/manifest.ts`, page hors ligne, `lib/i18n/{fr,ar}.ts` + `dir` dynamique (structure seulement), emplacements calculateur / conseils / routage WhatsApp par région.
- **Acceptation** : `/brand` absent du sitemap ; PWA installable ; Lighthouse SEO 100.

### Clôture
- [ ] Après la fusion de toutes les PR : tag `v1.0.0` avec notes de version (proposé au propriétaire, poussé seulement avec son accord).
