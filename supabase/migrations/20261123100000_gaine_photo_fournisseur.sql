-- Gaine goutte-à-goutte : photo du produit fournie par le propriétaire
-- (même chemin d'image, nouveau visuel), texte alternatif mis à jour et
-- produit mis en avant (« Sélection du moment » de l'accueil).
-- Ré-exécutable : la mise à jour donne toujours le même résultat.

update public.products
set image_alt = 'Rouleau de tuyau goutte-à-goutte noir cerclé de liens orange',
    image_url = '/images/products/gaine-goutte-a-goutte/main.webp',
    featured = true
where slug = 'gaine-goutte-a-goutte';
