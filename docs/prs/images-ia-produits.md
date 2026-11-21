# feat: visuels pour les 3 produits sans photo

## Objectif
Remplacer le logo gris des trois produits qui n'avaient pas de photo par une image du produit, de bonne qualité.

## Changements
- **3 visuels générés par IA** (votre choix, après une recherche infructueuse de photos libres sur Unsplash, Pexels et Wikimedia Commons) :
  - Pompe immergée inox 4" ;
  - Motopompe centrifuge inox (pompe de surface **électrique**, comme la fiche : 1 – 5,5 kW) ;
  - Coude PE fileté mâle 90°.
- Chaque visuel est en 1200 × 1200, WebP de 40 à 47 Ko, sous un nouveau nom (`ia.webp`) pour qu'aucun cache ne resserve l'ancienne image.
- Originaux 2048 × 2048 archivés dans `public/images/_archive/2026-11-images-ia/`, avec un README qui indique clairement **qu'il s'agit de visuels générés par IA**, pas de photos, et qu'ils sont à remplacer par de vraies photos.
- Une première version de la pompe immergée a été **écartée**. Elle portait :
  - un texte publicitaire et un nom de marque inventés sur le câble ;
  - une gravure « AISI 304 » non vérifiée ;
  - des accessoires non inclus.

  Les versions retenues sont demandées « produit seul, sans texte ni logo » et ont été validées par vous.
- La mention « Photos non contractuelles » reste affichée sur les fiches.

## Migration SQL (Supabase → SQL Editor) — à exécuter
`supabase/migrations/20261125100000_visuels_ia.sql`
- Elle remplace seulement l'ancienne image provisoire. **Une photo ajoutée depuis l'admin n'est jamais écrasée.**
- Elle peut être relancée sans risque.

## Checklist
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [x] `npm test` : 183 tests, dont :
  - taille, format et poids des visuels ;
  - archive et README présents ;
  - catalogue de secours ;
  - migration : visuels appliqués, et photo ajoutée depuis l'admin conservée.
- [x] Images servies par le serveur de production et par l'optimiseur d'images de Next.
- [ ] Après la migration : vérifier les 3 fiches, les cartes du catalogue et l'accueil sur saqia.site.

## Dépendances ajoutées
Aucune.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
