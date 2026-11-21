-- Visuels d'illustration (générés par IA) pour les 3 produits sans photo.
-- ---------------------------------------------------------------------------
-- À exécuter dans Supabase → SQL Editor. Idempotent : peut être relancé.
-- Voir public/images/_archive/2026-11-images-ia/README.md.
--
-- Seule l'ancienne image provisoire (main.webp) ou une image vide est
-- remplacée : une photo ajoutée depuis l'admin n'est jamais écrasée.

update public.products
set image_url = '/images/products/pompe-immergee-inox-4-pouces/ia.webp',
    image_alt = 'Pompe immergée de forage en acier inoxydable'
where slug = 'pompe-immergee-inox-4-pouces'
  and (image_url = '' or image_url = '/images/products/pompe-immergee-inox-4-pouces/main.webp');

update public.products
set image_url = '/images/products/motopompe-centrifuge-inox/ia.webp',
    image_alt = 'Pompe de surface électrique à corps en acier inoxydable'
where slug = 'motopompe-centrifuge-inox'
  and (image_url = '' or image_url = '/images/products/motopompe-centrifuge-inox/main.webp');

update public.products
set image_url = '/images/products/coude-pe-filete-male-90/ia.webp',
    image_alt = 'Coude PE à compression avec embout fileté en laiton'
where slug = 'coude-pe-filete-male-90'
  and (image_url = '' or image_url = '/images/products/coude-pe-filete-male-90/main.webp');
