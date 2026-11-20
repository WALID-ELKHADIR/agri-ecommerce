-- Admin complet (phase 3) : images de catégorie, galerie produit, stockage des
-- images et réglages du site.
-- ---------------------------------------------------------------------------
-- À exécuter dans Supabase → SQL Editor, après 20261120100000_catalogue_images.sql.
-- Idempotent : peut être relancé sans effet de bord.

-- ---------------------------------------------------------------------------
-- 1. Image de catégorie (facultative)
-- ---------------------------------------------------------------------------
alter table public.categories add column if not exists image_url text;

-- La suppression d'une gamme qui contient des produits est déjà refusée par la
-- clé étrangère products.category_id (aucune action en cascade).

-- ---------------------------------------------------------------------------
-- 2. Galerie des produits
-- ---------------------------------------------------------------------------
-- `products.image_url` reste l'image principale (lue par le site) ; la galerie
-- complète, ordonnée, vit ici. `storage_path` est renseigné pour les fichiers du
-- bucket product-images (il permet de supprimer le fichier avec l'image).
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null check (char_length(url) <= 1000),
  storage_path text check (storage_path is null or char_length(storage_path) <= 500),
  alt text not null default '' check (char_length(alt) <= 300),
  position integer not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

-- Une seule image principale par produit.
create unique index if not exists product_images_one_main_idx
  on public.product_images (product_id) where is_main;

alter table public.product_images enable row level security;

drop policy if exists "product images of published products are public" on public.product_images;
create policy "product images of published products are public"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.published
    )
  );

drop policy if exists "product images admin read all" on public.product_images;
create policy "product images admin read all"
  on public.product_images for select
  to authenticated
  using (public.is_admin());

drop policy if exists "product images admin write" on public.product_images;
create policy "product images admin write"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Stockage des images : bucket public `product-images`
-- ---------------------------------------------------------------------------
-- Lecture publique (URL directes du site) ; écriture réservée aux administrateurs.
-- Formats et poids limités côté serveur (l'admin compresse déjà en WebP).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product-images admin insert" on storage.objects;
create policy "product-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images admin update" on storage.objects;
create policy "product-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images admin delete" on storage.objects;
create policy "product-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Réglages du site
-- ---------------------------------------------------------------------------
-- Coordonnées affichées et numéros WhatsApp. Lecture publique (ce sont des
-- informations affichées sur le site) ; modification réservée aux admins.
-- Valeur vide = repli sur les variables NEXT_PUBLIC_* (voir lib/site-settings.ts).
create table if not exists public.settings (
  key text primary key check (key in ('contact', 'whatsapp_regions')),
  value jsonb not null default '{}'::jsonb check (octet_length(value::text) <= 10000),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings are public" on public.settings;
create policy "settings are public"
  on public.settings for select
  to anon, authenticated
  using (true);

drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists settings_touch_updated_at on public.settings;
create trigger settings_touch_updated_at
  before update on public.settings
  for each row execute function public.touch_updated_at();

insert into public.settings (key, value) values
  ('contact', '{}'::jsonb),
  ('whatsapp_regions', '[]'::jsonb)
on conflict (key) do nothing;
