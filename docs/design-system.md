# Design system Saqia — « terroir moderne »

Les tokens vivent dans `app/globals.css` (bloc `@theme`). Les composants de base vivent dans `components/ui/`. La page interne **`/design`** (non indexée) les montre tous, en état réel.

## Couleurs

Les palettes par défaut de Tailwind (`slate`, `cyan`, etc.) sont **désactivées** (`--color-*: initial`). Seules les couleurs de la marque existent. Une classe comme `bg-slate-100` ne produit donc aucun style : c'est volontaire.

| Palette | Nuances | Rôle |
|---|---|---|
| `field` | 50 → 900 | Primaire : boutons principaux, succès, fonds foncés (`field-900`) |
| `water` | 50 → 900 | Secondaire : liens, focus, accents d'information |
| `harvest` | 50, 100, 200, 300, 500, 800, 900 | Accent ponctuel (badges, nouveautés). **Toujours avec un texte foncé** |
| `soil` | 50 → 900 | Neutres chauds : fonds (`50`, `100`), bordures (`200`, `300`), textes (`500` à `900`) |
| `danger` | 50, 100, 200, 600, 700 | Erreurs et suppressions |
| `whatsapp`, `whatsapp-hover`, `whatsapp-brand` | — | **Uniquement** les boutons de conversion WhatsApp |

Les nuances données dans le brief sont reprises telles quelles. Les nuances intermédiaires (`field-300`, `water-700`, `soil-500`, etc.) ont été ajoutées pour couvrir les états, et chacune a été vérifiée en contraste.

### Couples texte / fond vérifiés (WCAG 2.1 AA, ≥ 4,5:1)

| Texte sur fond | Ratio | Usage |
|---|---|---|
| `soil-900` / `soil-50` | 16,0 | Texte principal |
| `soil-800` / `soil-50` | 12,2 | Libellés |
| `soil-600` / `soil-50` | 5,6 | Texte secondaire |
| `soil-500` / blanc · `soil-50` · `soil-100` | 5,5 · 5,2 · 4,8 | Texte discret, métadonnées, placeholders |
| `field-700` / `field-50` | 8,3 | Badge « Disponible » |
| `water-700` / `water-50` | 6,4 | Badge d'information |
| `harvest-800` / `harvest-100` | 6,6 | Badge d'accent |
| `danger-700` / `danger-50` · blanc | 6,8 · 7,5 | Erreurs |
| blanc / `field-600` | 6,7 | Bouton principal |
| blanc / `whatsapp` · `whatsapp-hover` | 5,4 · 7,2 | Bouton WhatsApp |
| blanc / `field-900` | 14,8 | Sections foncées |

`soil-400` (2,6:1) est réservé aux bordures et aux icônes décoratives, jamais au texte. Il ne faut jamais de texte blanc sur `harvest`.

## Typographie

| Classe | Taille (390 → 1440 px) | Usage |
|---|---|---|
| `text-display` | 40 → 76 px | Titre du hero, une fois par page au plus |
| `text-h1` | 32 → 52 px | Titre de page |
| `text-h2` | 26 → 38 px | Titre de section |
| `text-h3` | 20 → 24 px | Sous-titre, titre de carte importante |

Les titres combinent `font-display font-bold` (Bricolage Grotesque). L'interlignage et l'approche sont inclus dans le token. Le texte courant est en Geist, 15 à 17 px, avec une largeur de ligne de 80 caractères maximum (`max-w-prose`). Pas de capitales pour les intitulés.

## Rayons, ombres, mouvement

- **Rayons :** `rounded-control` (12 px, champs et boutons), `rounded-card` (18 px, cartes), `rounded-panel` (28 px, fenêtres et grandes sections). Plus l'élément est grand, plus le rayon l'est.
- **Ombres :** `shadow-soft` (repos), `shadow-lifted` (survol, éléments flottants), `shadow-overlay` (fenêtres). Elles sont teintées terre, jamais grises.
- **Mouvement :** courbe `ease-out-expo` (`cubic-bezier(0.22, 1, 0.36, 1)`) et durées `--duration-fast` (150 ms), `--duration-base` (250 ms), `--duration-slow` (400 ms), `--duration-reveal` (700 ms). Utilisation : `duration-(--duration-base)`.

## Accessibilité (règles appliquées partout)

- **Focus clavier :** contour `water-600` de 2 px, défini globalement. Un champ placé dans un conteneur stylé reporte ce contour sur le conteneur (`focus-within:outline-*`). On ne supprime jamais le focus sans le remplacer.
- **Cibles tactiles :** 44 px minimum (`min-h-11`, `h-11 w-11`). Pour un petit lien texte, on agrandit la zone cliquable sans toucher à la mise en page : `relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-['']`.
- **Mouvement réduit :** un garde-fou global rend toute animation ou transition quasi instantanée si l'utilisateur l'a demandé. Pour un effet coûteux, préférez quand même `motion-safe:`.
- **Fenêtres :** `Dialog` et `Sheet` utilisent l'élément natif `<dialog>`. Le piège de focus, la touche Échap, le fond inerte et le retour du focus sont gérés par le navigateur.

## Composants (`components/ui`)

| Composant | Fichier | À retenir |
|---|---|---|
| `Button`, `buttonClasses()` | `button.tsx` | Variantes `primary`, `secondary`, `ghost`, `whatsapp` ; tailles `sm`, `md`, `lg` ; `loading`, `fullWidth`. Pour un lien : `<Link className={buttonClasses({ variant: "secondary" })}>` |
| `Badge` | `badge.tsx` | Tons `neutral`, `field`, `water`, `harvest`, `danger`, `solid` |
| `Input`, `Select`, `Textarea` | `field.tsx` | Libellé obligatoire (`hideLabel` pour le masquer visuellement) ; `hint` et `error` sont reliés au champ via `aria-describedby` |
| `Dialog`, `Sheet` | `dialog.tsx` | Contrôlés (`open`, `onClose`) ; `Sheet` s'ouvre depuis le bas (`side="bottom"`) ou la droite |
| `ToastProvider`, `useToast()` | `toast.tsx` | Tons `success`, `info`, `error` ; 3 notifications au plus, fermeture automatique après 5 s, en pause au survol ou au focus ; les erreurs restent jusqu'à fermeture ; annonce séparée pour les lecteurs d'écran |
| `Skeleton` | `skeleton.tsx` | Taille fixée par `className` pour éviter tout décalage de mise en page |
| `EmptyState` | `empty-state.tsx` | Toujours avec une action pour en sortir |
| `SectionHeading` | `section-heading.tsx` | `as="h1" \| "h2" \| "h3"`, `description`, `action` |
| `Container` | `container.tsx` | `narrow`, `default`, `wide` ; marges de 16 px sur mobile |
