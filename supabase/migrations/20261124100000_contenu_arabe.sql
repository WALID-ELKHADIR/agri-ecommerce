-- Contenu en arabe des produits et des gammes (facultatif).
-- ---------------------------------------------------------------------------
-- À exécuter dans Supabase → SQL Editor, après les migrations précédentes.
-- Idempotent : peut être relancé sans effet de bord.
--
-- Chaque champ est saisi dans l'admin. Vide (null), le site arabe affiche le
-- texte français : aucune traduction automatique, aucune valeur inventée.
-- Les droits de lecture (grant select sur la table) et la RLS existantes
-- couvrent ces colonnes : rien à ajouter.

-- ---------------------------------------------------------------------------
-- 1. Produits
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists name_ar text;
alter table public.products add column if not exists description_ar text;
-- Même format que `specs` : liste de { label, value }.
alter table public.products add column if not exists specs_ar jsonb;

alter table public.products drop constraint if exists products_name_ar_length;
alter table public.products add constraint products_name_ar_length
  check (name_ar is null or char_length(name_ar) <= 160);

alter table public.products drop constraint if exists products_description_ar_length;
alter table public.products add constraint products_description_ar_length
  check (description_ar is null or char_length(description_ar) <= 2000);

alter table public.products drop constraint if exists products_specs_ar_array;
alter table public.products add constraint products_specs_ar_array
  check (specs_ar is null or jsonb_typeof(specs_ar) = 'array');

-- ---------------------------------------------------------------------------
-- 2. Gammes
-- ---------------------------------------------------------------------------
alter table public.categories add column if not exists label_ar text;
alter table public.categories add column if not exists short_ar text;
alter table public.categories add column if not exists description_ar text;

alter table public.categories drop constraint if exists categories_label_ar_length;
alter table public.categories add constraint categories_label_ar_length
  check (label_ar is null or char_length(label_ar) <= 80);

alter table public.categories drop constraint if exists categories_short_ar_length;
alter table public.categories add constraint categories_short_ar_length
  check (short_ar is null or char_length(short_ar) <= 40);

alter table public.categories drop constraint if exists categories_description_ar_length;
alter table public.categories add constraint categories_description_ar_length
  check (description_ar is null or char_length(description_ar) <= 400);
