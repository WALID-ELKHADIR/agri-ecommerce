-- Sécurité de l'administration
-- ---------------------------------------------------------------------------
-- Avant cette migration, tout utilisateur connecté (rôle `authenticated`)
-- pouvait modifier le catalogue et lire les demandes des clients.
-- Désormais, seuls les comptes listés dans `public.admin_users` le peuvent.
--
-- À exécuter une fois dans Supabase → SQL Editor, après 20261118000000_init.sql.
-- Idempotent : peut être relancé sans effet de bord.
--
-- Après l'avoir appliquée, déclarez votre compte administrateur :
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'vous@exemple.ma';

-- ---------------------------------------------------------------------------
-- 1. Administrateurs
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Aucune policy : la table n'est lisible qu'à travers is_admin() (security definer).
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Policies : écriture réservée aux administrateurs
-- ---------------------------------------------------------------------------
-- La lecture publique reste inchangée : catégories, et produits publiés.

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Les administrateurs voient aussi les produits non publiés (brouillons).
drop policy if exists "products admin read all" on public.products;
create policy "products admin read all"
  on public.products for select
  to authenticated
  using (public.is_admin());

-- Demandes : l'insertion reste ouverte à tous (policy de la migration init) ;
-- lecture, modification et suppression sont réservées aux administrateurs.
drop policy if exists "quotes admin read" on public.quote_requests;
create policy "quotes admin read"
  on public.quote_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "quotes admin update" on public.quote_requests;
create policy "quotes admin update"
  on public.quote_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "quotes admin delete" on public.quote_requests;
create policy "quotes admin delete"
  on public.quote_requests for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Demandes de devis : multi-produits et contraintes de taille
-- ---------------------------------------------------------------------------
-- `items` : liste [{ "slug", "name", "quantity" }] pour les devis multi-produits
-- (phase 4). `product_slug` / `quantity` restent pour les devis d'un seul produit.
alter table public.quote_requests
  add column if not exists items jsonb;

-- Les limites reprennent celles appliquées par le serveur (lib/quote-validation.ts).
-- `not valid` puis `validate` : aucune ligne existante n'est réécrite.
do $$
declare
  c record;
begin
  for c in
    select * from (values
      ('quote_requests_name_len',    'name is null or char_length(name) <= 120'),
      ('quote_requests_phone_len',   'phone is null or char_length(phone) <= 40'),
      ('quote_requests_email_len',   'email is null or char_length(email) <= 160'),
      ('quote_requests_profile_len', 'profile is null or char_length(profile) <= 120'),
      ('quote_requests_slug_len',    'product_slug is null or char_length(product_slug) <= 160'),
      ('quote_requests_message_len', 'message is null or char_length(message) <= 2000'),
      ('quote_requests_source_len',  'char_length(source) <= 40'),
      ('quote_requests_quantity',    'quantity is null or quantity between 1 and 100000'),
      ('quote_requests_items_shape', 'items is null or (jsonb_typeof(items) = ''array'' and jsonb_array_length(items) between 1 and 50 and octet_length(items::text) <= 20000)')
    ) as t(name, expr)
  loop
    if not exists (
      select 1 from pg_constraint
      where conname = c.name and conrelid = 'public.quote_requests'::regclass
    ) then
      execute format(
        'alter table public.quote_requests add constraint %I check (%s) not valid',
        c.name, c.expr
      );
      execute format(
        'alter table public.quote_requests validate constraint %I', c.name
      );
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Anti-spam : limite de débit des demandes
-- ---------------------------------------------------------------------------
-- Au plus 3 demandes par numéro de téléphone en 10 minutes, et 30 demandes
-- au total par minute. Au-delà, l'insertion échoue avec le code P0001 et le
-- message « rate_limited », que le serveur traduit pour le visiteur.
-- Les comptes administrateurs ne sont pas limités.
-- Pour les autres, `created_at` et `status` sont imposés par la base : la clé
-- anon étant publique, un robot pourrait sinon antidater ses demandes pour
-- échapper au comptage, ou les marquer « gagnées ».
-- Limite volontairement simple : les comptages ne posent pas de verrou, deux
-- envois strictement simultanés peuvent donc dépasser la limite d'une unité.
create index if not exists quote_requests_phone_created_idx
  on public.quote_requests (phone, created_at desc);

create or replace function public.quote_requests_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  new.created_at := now();
  new.status := 'new';

  if new.phone is not null and (
    select count(*) from public.quote_requests
    where phone = new.phone
      and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.quote_requests
    where created_at > now() - interval '1 minute'
  ) >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.quote_requests_rate_limit() from public;

drop trigger if exists quote_requests_rate_limit on public.quote_requests;
create trigger quote_requests_rate_limit
  before insert on public.quote_requests
  for each row execute function public.quote_requests_rate_limit();
