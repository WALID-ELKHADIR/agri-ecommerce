# Polices embarquées

`BricolageGrotesque-Bold.ttf` : instance statique (graisse 700, taille optique 48)
de Bricolage Grotesque, réduite aux caractères latins, utilisée par
`app/opengraph-image.tsx` (le moteur de rendu des images de partage ne lit pas
les polices variables).

Le crénage est volontairement retiré : le moteur de rendu l'applique au dessin
mais pas à la mesure des mots, ce qui créait un espace en trop après « L’eau ».

Générée avec fontTools (`varLib.instancer` puis `subset`) depuis la police de
google/fonts. Licence : SIL Open Font License 1.1 (voir `OFL.txt`).

Taille optique : 48 ici (texte de titre à ~90 px), 72 pour le wordmark vectorisé
(`scripts/brand/wordmarks.py`). C'est voulu : la taille optique adapte le dessin
à la taille d'affichage ; la graisse (700) est identique.
