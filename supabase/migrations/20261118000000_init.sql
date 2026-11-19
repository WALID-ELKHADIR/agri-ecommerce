-- AgriFlow — schéma catalogue + demandes de devis
-- À exécuter une seule fois dans Supabase → SQL Editor.
-- Idempotent : peut être relancé sans écraser les données existantes.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  label text not null,
  short text not null,
  description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Produits
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id text not null references public.categories (id) on update cascade,
  description text not null default '',
  image_url text not null,
  image_alt text not null default '',
  badge text,
  stock text not null default 'Disponible',
  specs jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_published_idx on public.products (published);

-- ---------------------------------------------------------------------------
-- Demandes de devis
-- ---------------------------------------------------------------------------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  profile text,
  product_slug text,
  quantity integer,
  message text,
  source text not null default 'site',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_created_idx
  on public.quote_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- Mise à jour automatique de updated_at
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.quote_requests enable row level security;

drop policy if exists "categories are public" on public.categories;
create policy "categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "published products are public" on public.products;
create policy "published products are public"
  on public.products for select
  to anon, authenticated
  using (published = true);

drop policy if exists "products admin write" on public.products;
create policy "products admin write"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "anyone can request a quote" on public.quote_requests;
create policy "anyone can request a quote"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "quotes admin read" on public.quote_requests;
create policy "quotes admin read"
  on public.quote_requests for select
  to authenticated
  using (true);

drop policy if exists "quotes admin update" on public.quote_requests;
create policy "quotes admin update"
  on public.quote_requests for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "quotes admin delete" on public.quote_requests;
create policy "quotes admin delete"
  on public.quote_requests for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Droits
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert on public.quote_requests to anon, authenticated;
grant select, insert, update, delete
  on public.categories, public.products, public.quote_requests
  to authenticated;

-- ---------------------------------------------------------------------------
-- Données de départ
-- ---------------------------------------------------------------------------
insert into public.categories (id, label, short, description, position) values
  ('pompes', 'Pompes & motopompes', 'Pompes',
   'Centrifuges, immergées, haute pression et motopompes.', 1),
  ('raccords', 'Raccords & fittings', 'Raccords',
   'Compression PE, PVC pression, filetés et pièces de réseau.', 2),
  ('kits', 'Kits complets', 'Kits',
   'Ensembles prêts à installer : pompe, coffret et câble.', 3)
on conflict (id) do nothing;

insert into public.products
  (slug, name, category_id, description, image_url, image_alt, badge, stock,
   specs, featured, published, position)
values
  (
    'kit-pompe-immergee-4-pouces',
    'Kit pompe immergée 4" complet',
    'kits',
    'Ensemble prêt à poser pour forage ou puits : pompe immergée inox, coffret de commande et câble électrique.',
    '/images/products/kit-pompe-immergee.jpg',
    'Kit de pompe immergée avec coffret de commande et câble',
    'Pack complet',
    'Disponible',
    '[{"label":"Puissance","value":"0,37 – 1,5 kW"},{"label":"Alimentation","value":"220 V mono"},{"label":"Inclus","value":"Coffret + câble"}]'::jsonb,
    true, true, 1
  ),
  (
    'pompe-immergee-inox-4-pouces',
    'Pompe immergée inox 4"',
    'pompes',
    'Pompe de forage en acier inoxydable, conçue pour l’irrigation et l’alimentation en eau sur de longues périodes.',
    '/images/products/pompe-immergee-4p.jpg',
    'Pompe immergée inoxydable 4 pouces',
    null,
    'Disponible',
    '[{"label":"Puissance","value":"0,5 – 2,2 kW"},{"label":"Débit","value":"jusqu’à 8 m³/h"},{"label":"Diamètre","value":"4 pouces"}]'::jsonb,
    true, true, 2
  ),
  (
    'pompe-centrifuge-monobloc',
    'Pompe centrifuge monobloc',
    'pompes',
    'Pompe de surface robuste pour l’irrigation, le transfert d’eau et les réseaux de distribution agricoles.',
    '/images/products/pompe-centrifuge-monobloc.jpg',
    'Pompe centrifuge monobloc bleu acier',
    null,
    'Disponible',
    '[{"label":"Puissance","value":"0,75 – 7,5 kW"},{"label":"Alimentation","value":"220 / 380 V"},{"label":"Débit","value":"6 – 60 m³/h"}]'::jsonb,
    true, true, 3
  ),
  (
    'motopompe-centrifuge-inox',
    'Motopompe centrifuge inox',
    'pompes',
    'Corps de pompe en inox pour les eaux claires et les usages intensifs : serres, aspersion, transfert.',
    '/images/products/motopompe-inox.jpg',
    'Motopompe centrifuge avec corps en inox',
    'Inox',
    'Sur commande',
    '[{"label":"Puissance","value":"1 – 5,5 kW"},{"label":"Corps","value":"Acier inoxydable"},{"label":"Usage","value":"Irrigation / transfert"}]'::jsonb,
    true, true, 4
  ),
  (
    'pompe-centrifuge-haute-pression',
    'Pompe centrifuge haute pression',
    'pompes',
    'Solution de pompage à forte hauteur manométrique pour réseaux sous pression et aspersion.',
    '/images/products/pompe-haute-pression.jpg',
    'Pompe centrifuge haute pression de grande taille',
    null,
    'Sur commande',
    '[{"label":"Puissance","value":"2 – 15 kW"},{"label":"HMT","value":"jusqu’à 90 m"},{"label":"Corps","value":"Fonte / inox"}]'::jsonb,
    false, true, 5
  ),
  (
    'pompe-centrifuge-fonte',
    'Pompe centrifuge fonte',
    'pompes',
    'Modèle économique et endurant pour l’irrigation de plein champ et le transfert d’eau claire.',
    '/images/products/pompe-centrifuge-fonte.jpg',
    'Pompe centrifuge en fonte bleue',
    null,
    'Disponible',
    '[{"label":"Puissance","value":"0,75 – 4 kW"},{"label":"Alimentation","value":"220 / 380 V"},{"label":"Usage","value":"Intensif"}]'::jsonb,
    false, true, 6
  ),
  (
    'gamme-pompes-immergees-inox',
    'Gamme pompes immergées inox',
    'pompes',
    'Gamme professionnelle 4" et 6" pour forages profonds, avec plusieurs puissances et débits au choix.',
    '/images/products/pompes-immergees-serie.jpg',
    'Série de pompes immergées inox en atelier',
    'Gamme pro',
    'Disponible',
    '[{"label":"Diamètres","value":"4\" et 6\""},{"label":"Puissance","value":"0,5 – 7,5 kW"},{"label":"Usage","value":"Forages profonds"}]'::jsonb,
    true, true, 7
  ),
  (
    'coude-pe-compression-90',
    'Coude PE à compression 90°',
    'raccords',
    'Raccord à compression pour tuyaux PE, étanchéité haute pression et montage sans outil spécifique.',
    '/images/products/raccord-pe-90.jpg',
    'Coude PE à compression 90 degrés noir et bleu',
    'Best-seller',
    'Disponible',
    '[{"label":"Diamètre","value":"Ø20 – 63 mm"},{"label":"Pression","value":"PN16"},{"label":"Montage","value":"Sans outil"}]'::jsonb,
    true, true, 8
  ),
  (
    'coude-pe-filete-male-90',
    'Coude PE fileté mâle 90°',
    'raccords',
    'Raccord de transition PE vers filetage mâle, avec inserts laiton pour une étanchéité durable.',
    '/images/products/raccord-pe-90-metal.jpg',
    'Coude PE fileté mâle à compression',
    null,
    'Disponible',
    '[{"label":"Diamètre","value":"Ø20 – 50 mm"},{"label":"Filetage","value":"Laiton mâle"},{"label":"Étanchéité","value":"Renforcée"}]'::jsonb,
    false, true, 9
  ),
  (
    'te-pvc-pression',
    'Té PVC pression',
    'raccords',
    'Té de distribution PVC pour réseaux sous pression, assemblage par collage solvant.',
    '/images/products/te-pvc.jpg',
    'Té PVC pression gris sur établi',
    null,
    'Disponible',
    '[{"label":"Diamètre","value":"Ø32 – 110 mm"},{"label":"Pression","value":"PN10 / PN16"},{"label":"Assemblage","value":"Collage solvant"}]'::jsonb,
    false, true, 10
  ),
  (
    'coude-pe-reseau-enterre',
    'Coude PE pour réseau enterré',
    'raccords',
    'Raccord PE résistant aux UV et à l’enfouissement, pensé pour les réseaux d’irrigation durables.',
    '/images/products/raccord-pe-terrain.jpg',
    'Raccord PE installé sur un réseau d’irrigation enterré',
    'Résistant UV',
    'Disponible',
    '[{"label":"Diamètre","value":"Ø25 – 63 mm"},{"label":"Usage","value":"Réseau enterré"},{"label":"Matériau","value":"PE haute densité"}]'::jsonb,
    false, true, 11
  )
on conflict (slug) do nothing;
