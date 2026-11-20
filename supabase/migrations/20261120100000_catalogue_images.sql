-- Catalogue : nouvelles catégories, nouveaux produits et nouvelles images
-- ---------------------------------------------------------------------------
-- Phase 2bis. Les photos du stock réel remplacent les anciennes images.
-- Construit à partir de lib/catalog.ts et lib/images-manifest.ts (phase 2bis).
-- Migration figée une fois appliquée : pour corriger, créez-en une nouvelle.
--
-- À exécuter dans Supabase → SQL Editor, après 20261119100000_admin_rls.sql.
-- Idempotent ; ne remplace jamais une image ou un produit modifié depuis l'admin.

-- 1. Catégories
insert into public.categories (id, label, short, description, position) values
  ('accessoires-pompage', 'Accessoires de pompage', 'Accessoires', 'Coffrets de commande, clapets et crépines pour vos installations de pompage.', 4),
  ('arrosage', 'Arrosage & goutte-à-goutte', 'Arrosage', 'Asperseurs, mini-vannes, raccords de gaine et accessoires de micro-irrigation.', 5),
  ('outillage', 'Motoculture & outillage', 'Outillage', 'Matériel d''entretien des parcelles et des abords.', 6)
on conflict (id) do nothing;

-- 2. Nouvelles images des produits existants
-- Seulement si l'image en base est encore un ancien chemin (/images/products/*.jpg).
-- Le texte alternatif n'est remplacé que s'il est encore celui d'origine.
update public.products set image_url = '/images/products/kit-pompe-immergee-4-pouces/main.webp',
    image_alt = case when image_alt in ('', 'Kit de pompe immergée avec coffret de commande et câble') then 'Kit pompe immergée : pompe inox, coffret de commande et câble' else image_alt end
  where slug = 'kit-pompe-immergee-4-pouces' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/pompe-immergee-inox-4-pouces/main.webp',
    image_alt = case when image_alt in ('', 'Pompe immergée inoxydable 4 pouces') then 'Photo du produit à venir' else image_alt end
  where slug = 'pompe-immergee-inox-4-pouces' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/pompe-centrifuge-monobloc/main.webp',
    image_alt = case when image_alt in ('', 'Pompe centrifuge monobloc bleu acier') then 'Pompe centrifuge monobloc à grand orifice d''aspiration' else image_alt end
  where slug = 'pompe-centrifuge-monobloc' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/motopompe-centrifuge-inox/main.webp',
    image_alt = case when image_alt in ('', 'Motopompe centrifuge avec corps en inox') then 'Photo du produit à venir' else image_alt end
  where slug = 'motopompe-centrifuge-inox' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/pompe-centrifuge-haute-pression/main.webp',
    image_alt = case when image_alt in ('', 'Pompe centrifuge haute pression de grande taille') then 'Pompe centrifuge à brides avec moteur électrique' else image_alt end
  where slug = 'pompe-centrifuge-haute-pression' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/pompe-centrifuge-fonte/main.webp',
    image_alt = case when image_alt in ('', 'Pompe centrifuge en fonte bleue') then 'Pompe centrifuge en fonte à brides' else image_alt end
  where slug = 'pompe-centrifuge-fonte' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/gamme-pompes-immergees-inox/main.webp',
    image_alt = case when image_alt in ('', 'Série de pompes immergées inox en atelier') then 'Pompes immergées inox alignées en atelier, câbles bleus' else image_alt end
  where slug = 'gamme-pompes-immergees-inox' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/coude-pe-compression-90/main.webp',
    image_alt = case when image_alt in ('', 'Coude PE à compression 90 degrés noir et bleu') then 'Coude PE à compression 90°, corps noir et écrous bleus' else image_alt end
  where slug = 'coude-pe-compression-90' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/coude-pe-filete-male-90/main.webp',
    image_alt = case when image_alt in ('', 'Coude PE fileté mâle à compression') then 'Photo du produit à venir' else image_alt end
  where slug = 'coude-pe-filete-male-90' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/te-pvc-pression/main.webp',
    image_alt = case when image_alt in ('', 'Té PVC pression gris sur établi') then 'Té PVC pression gris' else image_alt end
  where slug = 'te-pvc-pression' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';
update public.products set image_url = '/images/products/coude-pe-reseau-enterre/main.webp',
    image_alt = case when image_alt in ('', 'Raccord PE installé sur un réseau d’irrigation enterré') then 'Coude PE à compression pour réseau d''irrigation' else image_alt end
  where slug = 'coude-pe-reseau-enterre' and image_url ~* '^/images/products/[^/]+\.(jpe?g|png)$';

-- 3. Nouveaux produits (caractéristiques à compléter depuis l'admin)
insert into public.products
  (slug, name, category_id, description, image_url, image_alt, stock, specs, featured, published, position)
values
  ('asperseur-impact', 'Asperseur à impact', 'arrosage', 'Asperseur rotatif à impact pour l''arrosage par aspersion des grandes surfaces.', '/images/products/asperseur-impact/main.webp', 'Asperseur à impact vert, buse et ressort en laiton', 'Sur demande', '[]'::jsonb, false, true, 100),
  ('asperseur-impact-orange', 'Asperseur à impact (modèle orange)', 'arrosage', 'Asperseur rotatif à impact en matière plastique, pour l''arrosage par aspersion.', '/images/products/asperseur-impact-orange/main.webp', 'Asperseur à impact orange tenu en main', 'Sur demande', '[]'::jsonb, false, true, 101),
  ('micro-asperseur-piquet', 'Micro-asperseur rotatif sur piquet', 'arrosage', 'Micro-asperseur rotatif à planter, pour l''arrosage localisé des cultures.', '/images/products/micro-asperseur-piquet/main.webp', 'Micro-asperseur rotatif sur piquet, déflecteur orange', 'Sur demande', '[]'::jsonb, false, true, 102),
  ('mini-asperseur-piquet', 'Mini-asperseur sur piquet', 'arrosage', 'Mini-asperseur monté sur piquet, à raccorder sur une ligne d''irrigation.', '/images/products/mini-asperseur-piquet/main.webp', 'Mini-asperseur sur piquet bleu', 'Sur demande', '[]'::jsonb, false, true, 103),
  ('mini-vanne-16-ecrous', 'Mini-vanne goutte-à-goutte 16 mm à écrous', 'arrosage', 'Mini-vanne d''arrêt pour tuyau goutte-à-goutte de 16 mm, raccordement par écrous.', '/images/products/mini-vanne-16-ecrous/main.webp', 'Mini-vanne 16 mm à écrous verts, poignée bleue', 'Sur demande', '[]'::jsonb, false, true, 104),
  ('mini-vanne-16-cannelee', 'Mini-vanne goutte-à-goutte 16 mm cannelée', 'arrosage', 'Mini-vanne d''arrêt pour tuyau goutte-à-goutte de 16 mm, embouts cannelés.', '/images/products/mini-vanne-16-cannelee/main.webp', 'Mini-vanne 16 mm à embouts cannelés, poignée bleue', 'Sur demande', '[]'::jsonb, false, true, 105),
  ('raccord-depart-gaine', 'Raccord de départ pour gaine', 'arrosage', 'Raccord de départ pour relier une gaine ou un tuyau goutte-à-goutte à la conduite principale.', '/images/products/raccord-depart-gaine/main.webp', 'Raccord de départ pour gaine goutte-à-goutte, écrou bleu', 'Sur demande', '[]'::jsonb, false, true, 106),
  ('raccord-gaine', 'Raccord pour gaine goutte-à-goutte', 'arrosage', 'Raccord pour gaine et tuyau de goutte-à-goutte.', '/images/products/raccord-gaine/main.webp', 'Raccord pour gaine goutte-à-goutte, écrous bleus', 'Sur demande', '[]'::jsonb, false, true, 107),
  ('poincon-goutte-a-goutte', 'Poinçon pour tuyau goutte-à-goutte', 'arrosage', 'Outil à poignée pour percer proprement les tuyaux avant la pose des raccords et goutteurs.', '/images/products/poincon-goutte-a-goutte/main.webp', 'Poinçon à poignée en T bleue pour percer les tuyaux', 'Sur demande', '[]'::jsonb, false, true, 108),
  ('injecteur-venturi', 'Injecteur d''engrais Venturi', 'arrosage', 'Injecteur Venturi pour incorporer les engrais à l''eau d''irrigation (fertigation).', '/images/products/injecteur-venturi/main.webp', 'Injecteur d''engrais Venturi avec tuyau d''aspiration transparent', 'Sur demande', '[]'::jsonb, false, true, 109),
  ('clapet-crepine-pvc', 'Clapet crépine PVC', 'accessoires-pompage', 'Clapet crépine à placer en bout d''aspiration : filtre l''eau et maintient la pompe amorcée.', '/images/products/clapet-crepine-pvc/main.webp', 'Clapet crépine PVC gris à brides', 'Sur demande', '[]'::jsonb, false, true, 110),
  ('coffret-commande-pompe', 'Coffret de commande pour pompe immergée', 'accessoires-pompage', 'Coffret électrique de démarrage et de protection pour pompe immergée monophasée.', '/images/products/coffret-commande-pompe/main.webp', 'Coffret de commande pour pompe immergée, interrupteur rouge et câble', 'Sur demande', '[]'::jsonb, false, true, 111),
  ('debroussailleuse-thermique', 'Débroussailleuse thermique', 'outillage', 'Débroussailleuse à moteur thermique, livrée avec ses accessoires de coupe.', '/images/products/debroussailleuse-thermique/main.webp', 'Débroussailleuse thermique avec guidon et harnais', 'Sur demande', '[]'::jsonb, false, true, 112),
  ('colle-pvc', 'Colle PVC', 'raccords', 'Colle pour l''assemblage des tubes et raccords en PVC pression.', '/images/products/colle-pvc/main.webp', 'Flacon de colle PVC', 'Sur demande', '[]'::jsonb, false, true, 113)
on conflict (slug) do nothing;
