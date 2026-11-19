# Charte de marque Saqia

## Le nom

**Saqia** vient de l’arabe **ساقية** : la rigole, le petit canal qui amène l’eau jusqu’aux cultures. Au Maroc, le mot désigne aussi le réseau traditionnel d’irrigation des parcelles.

C’est exactement le métier de la marque : fournir les pompes, raccords et kits qui font arriver l’eau au bon endroit.

- **Slogan :** L’eau au bon endroit.
- **Sous-titre :** Pompes & irrigation — devis sur WhatsApp
- **Écriture :** « Saqia » dans le texte courant (majuscule initiale), « saqia » en minuscules uniquement dans le logo.

## Ton de voix

| Principe | Ce qu’on fait | Ce qu’on évite |
|---|---|---|
| Direct | Phrases courtes, l’information utile d’abord (débit, diamètre, délai). | Les formules creuses (« solutions innovantes », « leader du marché »). |
| Rassurant | On dit ce qui se passe ensuite : « Un technicien vous répond sous 24 h. » | Les promesses invérifiables, les urgences artificielles. |
| Technique sans jargon | On donne le chiffre et on l’explique : « HMT 40 m, soit la hauteur à laquelle la pompe peut monter l’eau. » | Les sigles non expliqués, l’anglais inutile. |
| Respectueux | Vouvoiement, toujours. | Le tutoiement, les familiarités. |

### Messages WhatsApp (exemples)

**Message pré-rempli par le site depuis une fiche produit (FR)**, généré par `productMessage` dans `lib/catalog.ts` :
> Bonjour Saqia 👋,
> Je souhaite un devis pour :
> • Pompe immergée inox 4" — 2 unités
>   Puissance : 0,5 – 2,2 kW
>   Débit : jusqu’à 8 m³/h
>
> Merci de me communiquer le prix, la disponibilité et le délai de livraison.

**Première réponse de l’équipe (FR)**
> Bonjour et merci pour votre demande. Pour vous proposer la bonne pompe, pouvez-vous nous indiquer la profondeur du forage et le débit souhaité (en m³/h) ? Une photo de votre installation nous aide aussi.

**Première réponse (darija, en caractères latins)**
> Salam, choukran 3la talab dyalek. Bach n9tar7o 3lik la pompe li mnasba, 3afak 3tina l3om9 dyal l'bir w ch7al dyal l'ma bghiti f sa3a (m³/h). Ila 3ndek tswira dyal l'installation, sifetha lina.

**Relance après devis (FR)**
> Bonjour, nous revenons vers vous au sujet du devis envoyé mardi. Avez-vous des questions sur la pompe proposée ? Nous pouvons aussi vous appeler si c’est plus simple.

## Logo

Le symbole **Parcelle** est une parcelle pleine, traversée de bord à bord par un canal en S. Il fusionne trois choses : la lettre **S**, la **rigole** qui irrigue, et le **champ** qu’elle partage.

### Fichiers

Tous les fichiers sont générés par `node scripts/brand/build-assets.ts` à partir de `lib/brand/logo-svg.ts`. Ne les modifiez pas à la main.

| Usage | Fichier |
|---|---|
| Logo complet (couleur, mono, inversé) | `public/brand/logo-full.svg`, `logo-full-mono.svg`, `logo-full-inverse.svg` |
| Logo complet en arabe | `public/brand/logo-full-ar.svg` |
| Symbole seul | `public/brand/logo-symbol.svg` (+ `-mono`, `-inverse`) |
| Wordmarks seuls | `public/brand/logo-wordmark.svg`, `logo-wordmark-ar.svg` |
| Logo PNG (documents, devis) | `public/brand/logo-full.png` (1024 px) |
| Photo de profil WhatsApp Business / réseaux | `public/brand/avatar-640.png` (clair), `avatar-640-dark.png` (foncé) |
| Icônes d’application | `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` |
| Favicon / icônes navigateur | `app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png` |

Dans le code, utilisez le composant `components/brand/logo.tsx` :

```tsx
<Logo className="h-9 w-auto" />                      // logo complet couleur
<Logo variant="symbol" small className="h-6 w-6" />  // symbole ≤ 32 px
<Logo tone="inverse" lang="ar" />                    // arabe, sur fond foncé
<Logo animated />                                    // hero : tracé du canal
```

### Versions

- **Couleur** (par défaut) : parcelle field-600, canal water-600, texte soil-900, sur fond clair.
- **Monochrome** : tout en soil-900, pour l’impression une couleur, les tampons et les gravures. Dans le composant React, la version mono prend la couleur du texte (`currentColor`).
- **Inversée** : tout en blanc, sur field-900 ou sur une photo assombrie.

### Zone de protection et tailles minimales

- **Zone de protection :** un quart de la hauteur du symbole, sur les quatre côtés. Rien n’y entre (texte, bord d’écran, autre logo).
- **Symbole :** 16 px minimum à l’écran. En dessous de 32 px, utilisez la version renforcée (`small`), dont le canal est plus épais.
- **Logo complet :** 24 px de haut minimum à l’écran, 12 mm de large à l’impression.

### Interdits

- ❌ Changer les couleurs, ou utiliser le **vert WhatsApp** dans le logo. Ce vert est réservé aux boutons de conversion.
- ❌ Déformer, incliner ou faire pivoter le logo.
- ❌ Ajouter une ombre, un contour, un dégradé ou un effet 3D.
- ❌ Séparer le canal de la parcelle, ou combler l’espace blanc qui les sépare.
- ❌ Poser la version couleur sur une photo chargée : utilisez la version inversée sur une zone sombre.
- ❌ Récrire « saqia » avec une autre police : utilisez toujours les fichiers vectorisés.

## Couleurs

| Nom | Hex | Rôle |
|---|---|---|
| field-600 | `#3a6631` | Couleur primaire, parcelle du logo |
| field-900 | `#1a2c18` | Fonds foncés, version inversée |
| water-600 | `#177c87` | Couleur secondaire, canal du logo, liens |
| harvest-300 | `#f6c75f` | Accent ponctuel (badges), **texte foncé uniquement** |
| soil-50 | `#faf8f3` | Fond principal |
| soil-600 | `#6b6352` | Texte secondaire |
| soil-900 | `#1f1c16` | Texte principal |
| whatsapp | `#0f7a43` | **Uniquement** les boutons WhatsApp, avec du texte blanc |

La palette complète (nuances 50 à 900) arrive avec le design system, en phase 2.

### Contrastes vérifiés (WCAG 2.1)

| Combinaison | Ratio | Usage permis |
|---|---|---|
| soil-900 sur soil-50 | 16,0:1 | Tout texte |
| soil-600 sur soil-50 | 5,6:1 | Texte secondaire |
| field-600 sur soil-50 | 6,3:1 | Texte et titres |
| water-600 sur blanc | 4,9:1 | Liens, texte ≥ 14 px |
| water-600 sur soil-50 | 4,6:1 | Liens, texte ≥ 14 px |
| blanc sur field-600 | 6,7:1 | Boutons |
| blanc sur field-900 | 14,8:1 | Tout texte |
| blanc sur whatsapp | 5,4:1 | Bouton WhatsApp |
| soil-900 sur harvest-300 | 10,7:1 | Badges |
| ~~blanc sur harvest-500 (`#e09b1a`, accent foncé de la phase 2)~~ | 2,4:1 | ❌ Interdit : jamais de texte blanc sur les jaunes |

## Typographie

| Police | Rôle | Chargement |
|---|---|---|
| **Bricolage Grotesque** | Titres, chiffres clés, wordmark | `next/font` (variable, axe de taille optique), classe `font-display` |
| **Geist** | Texte courant, interface | `next/font`, classe `font-sans` (par défaut) |
| **IBM Plex Sans Arabic** | Textes en arabe | `next/font`, à charger avec la version arabe du site (phase 5) |

Pourquoi Bricolage Grotesque : une grotesque au dessin un peu rustique, avec du caractère dans les grandes tailles. Elle évoque l’outil et le terrain plutôt que le magazine.

Règles :
- Titres en Bricolage, graisse 700, approche légèrement resserrée (-0,03 em).
- Pas de capitales pour les intitulés : on garde la casse de phrase.
- Lignes de texte de moins de 80 caractères.
