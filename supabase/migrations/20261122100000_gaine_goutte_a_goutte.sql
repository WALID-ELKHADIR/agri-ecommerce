-- Ajout du produit « Tuyau goutte-à-goutte (gaine / drip tape) » dans la gamme
-- Arrosage & goutte-à-goutte. Migration ré-exécutable (on conflict do nothing).
--
-- Caractéristiques : plages usuelles du marché, marquées « selon modèle »
-- (choix du propriétaire du 2026-11-21, en attendant la fiche du fournisseur).
-- À remplacer par les valeurs exactes depuis l'admin dès qu'elles sont connues.
-- Photo : illustration (Unsplash, Marc Pell), pas une photo du produit exact.

insert into public.products
  (slug, name, category_id, description, image_url, image_alt, stock, specs, featured, published, position)
values
  (
    'gaine-goutte-a-goutte',
    'Tuyau goutte-à-goutte (gaine / drip tape)',
    'arrosage',
    'Gaine souple à goutteurs intégrés pour l''irrigation localisée des cultures en rangs : maraîchage, plein champ et serres. Caractéristiques indicatives selon le modèle, confirmées sur le devis.',
    '/images/products/gaine-goutte-a-goutte/main.webp',
    'Lignes de goutte-à-goutte posées au pied de jeunes plants',
    'Sur demande',
    '[
      {"label": "Diamètre", "value": "16 mm (selon modèle)"},
      {"label": "Épaisseur de paroi", "value": "0,15 à 0,40 mm (selon modèle)"},
      {"label": "Espacement des goutteurs", "value": "10 à 40 cm (selon modèle)"},
      {"label": "Débit par goutteur", "value": "0,6 à 2,5 L/h (selon modèle)"},
      {"label": "Pression de service", "value": "0,5 à 1 bar (selon modèle)"},
      {"label": "Longueur du rouleau", "value": "500 à 3 000 m (selon modèle)"}
    ]'::jsonb,
    false,
    true,
    114
  )
on conflict (slug) do nothing;
