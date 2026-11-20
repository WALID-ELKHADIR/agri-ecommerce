// Fichier généré par scripts/images/process-images.ts — ne pas modifier à la main.
// Images produits du site : chemin, dimensions, texte alternatif, origine,
// placeholder flou et couleur dominante (chargement sans saut de mise en page).

export type ImageSource = "photo" | "placeholder";

export type ManifestImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** "placeholder" : image provisoire, photo du produit à fournir. */
  source: ImageSource;
  /** Photo d'origine dans public/images/_archive/2026-11-photos-fournisseur/. */
  original: string | null;
  blurDataURL: string;
  dominantColor: string;
  bytes: number;
  /** Empreinte du contenu (versionne les copies dans Supabase Storage). */
  hash: string;
};

export type ProductImages = {
  main: ManifestImage;
  gallery: ManifestImage[];
  /** Correspondance photo → produit à faire confirmer. */
  toConfirm: string | null;
};

export const PRODUCT_IMAGES: Record<string, ProductImages> = {
  "kit-pompe-immergee-4-pouces": {
    "main": {
      "src": "/images/products/kit-pompe-immergee-4-pouces/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Kit pompe immergée : pompe inox, coffret de commande et câble",
      "source": "photo",
      "original": "photo-05.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoMAAwAA4BaJZwAAudf/2ocigAA/vfxGGtVpeSCcLF8LOZAeUvtxl86h7dHIgcFrgVj5D/mGT4AAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 17540,
      "hash": "d42ab6f7e3"
    },
    "gallery": [],
    "toConfirm": null
  },
  "pompe-immergee-inox-4-pouces": {
    "main": {
      "src": "/images/products/pompe-immergee-inox-4-pouces/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Photo du produit à venir",
      "source": "placeholder",
      "original": null,
      "blurDataURL": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAACQAQCdASoMAAwAA4BaJZQAAudPk4gA/vYC8B0OW9wQAA==",
      "dominantColor": "#f8e8e8",
      "bytes": 3438,
      "hash": "c777176fb6"
    },
    "gallery": [],
    "toConfirm": null
  },
  "pompe-centrifuge-monobloc": {
    "main": {
      "src": "/images/products/pompe-centrifuge-monobloc/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Pompe centrifuge monobloc à grand orifice d'aspiration",
      "source": "photo",
      "original": "photo-07.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoMAAwAA4BaJZwAAusoNO9mYIAA/vZqVHr/KI0lzkN0RvYCXIUDCYioMBtYh7euTJtLZH7odgz29VqKEt/ySgAAAAA=",
      "dominantColor": "#f8f8f8",
      "bytes": 27266,
      "hash": "f7190d4c66"
    },
    "gallery": [],
    "toConfirm": null
  },
  "motopompe-centrifuge-inox": {
    "main": {
      "src": "/images/products/motopompe-centrifuge-inox/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Photo du produit à venir",
      "source": "placeholder",
      "original": null,
      "blurDataURL": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAACQAQCdASoMAAwAA4BaJZQAAudPk4gA/vYC8B0OW9wQAA==",
      "dominantColor": "#f8e8e8",
      "bytes": 3438,
      "hash": "c777176fb6"
    },
    "gallery": [],
    "toConfirm": null
  },
  "pompe-centrifuge-haute-pression": {
    "main": {
      "src": "/images/products/pompe-centrifuge-haute-pression/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Pompe centrifuge à brides avec moteur électrique",
      "source": "photo",
      "original": "photo-10.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAQCdASoMAAwAA4BaJZwAAui+TtLQAAD+9z4k82XAlElS8fkBuy5aRNx73YvYGyZ1S4aCCli/2bp98u9aA9bRiLBrg5KEAAA=",
      "dominantColor": "#f8f8f8",
      "bytes": 26794,
      "hash": "c0efee5f37"
    },
    "gallery": [
      {
        "src": "/images/products/pompe-centrifuge-haute-pression/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Pompe centrifuge normalisée, vue de trois quarts",
        "source": "photo",
        "original": "photo-13.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoMAAwAA4BaJZwCsAELVku3wQAA/vc+nYwsQMLfDkF5IR8/VXNXI71RlG/Weu49dl9Lb4Nb2h4kHfhwLFExUAAA",
        "dominantColor": "#f8f8f8",
        "bytes": 34534,
        "hash": "36d7cc4077"
      }
    ],
    "toConfirm": "Photos 10 et 13 : bien ce modèle haute pression ?"
  },
  "pompe-centrifuge-fonte": {
    "main": {
      "src": "/images/products/pompe-centrifuge-fonte/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Pompe centrifuge en fonte à brides",
      "source": "photo",
      "original": "photo-08.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAABQAgCdASoMAAwAA4BaJYwC7AYu5whv7YhwDwAA/vVJePoxbE3a7sa8jzv6XpafbL6SyJs80IivCHXR9U6+qqnWQCPNRV3S4zL2ixRxT2AAAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 29610,
      "hash": "dfa9396a18"
    },
    "gallery": [
      {
        "src": "/images/products/pompe-centrifuge-fonte/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Pompe centrifuge en fonte, vue de trois quarts",
        "source": "photo",
        "original": "photo-09.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoMAAwAA4BaJQBWACFr5eGAAAD+9mpUewSYxQQP5fND5OWV4b2mOFj6rF16QReCxbeKldfdzxbctAMgU2o8tv3XeEsAAA==",
        "dominantColor": "#f8f8f8",
        "bytes": 26370,
        "hash": "3b77c00d98"
      }
    ],
    "toConfirm": "Photos 8 et 9 : bien ce modèle en fonte ?"
  },
  "gamme-pompes-immergees-inox": {
    "main": {
      "src": "/images/products/gamme-pompes-immergees-inox/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Pompes immergées inox alignées en atelier, câbles bleus",
      "source": "photo",
      "original": "photo-11.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoMAAwAA4BaJZQAAlokXUsmjAAA/mEIvzy4IA5Klj1c0ymvapdwCbZgzSJWpN38xtIC/MNFVVs2mD7b6JoBDVHrv6HDE/FW2AA=",
      "dominantColor": "#c8c8c8",
      "bytes": 139022,
      "hash": "0a7e03dab0"
    },
    "gallery": [
      {
        "src": "/images/products/gamme-pompes-immergees-inox/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Rangée de pompes immergées inox prêtes à l'expédition",
        "source": "photo",
        "original": "photo-12.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoMAAwAA4BaJYwAAiy3raafvAAA3g6teib5Utih2KBz3JsqdwaPGsshVKIkAl1dFB8YCihxygGFoF7gAAA=",
        "dominantColor": "#787868",
        "bytes": 102522,
        "hash": "41732b4150"
      }
    ],
    "toConfirm": null
  },
  "coude-pe-compression-90": {
    "main": {
      "src": "/images/products/coude-pe-compression-90/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Coude PE à compression 90°, corps noir et écrous bleus",
      "source": "photo",
      "original": "photo-03.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQAgCdASoMAAwAA4BaJQBOgMWCtsxiSUwAAP72RrTjEjjgP47kcf9jyEHscy7zCQ9v28STRYOrhVvxoQscdtR8iAVb8o4R11nMCWGLGtglK9IbW2JpIxvd4P50UQtJ1/FAoAAA",
      "dominantColor": "#f8f8f8",
      "bytes": 26480,
      "hash": "aeda14e6f7"
    },
    "gallery": [
      {
        "src": "/images/products/coude-pe-compression-90/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Coude PE à compression monté sur un réseau de tuyaux",
        "source": "photo",
        "original": "photo-02.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAwAgCdASoMAAwAA4BaJQBOgBwzGrSCMP58AAD+50a9V6xq3/CyGAsjIFur8gMF/PxuhoIsedNd5LRohX2TrEkmPDtpFRLBDJWnjC+egHfWCcK2A0GLxiDit5dNUzHbu0LlIsAA",
        "dominantColor": "#d8d8d8",
        "bytes": 50452,
        "hash": "ebe3edc9b5"
      }
    ],
    "toConfirm": null
  },
  "coude-pe-filete-male-90": {
    "main": {
      "src": "/images/products/coude-pe-filete-male-90/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Photo du produit à venir",
      "source": "placeholder",
      "original": null,
      "blurDataURL": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAACQAQCdASoMAAwAA4BaJZQAAudPk4gA/vYC8B0OW9wQAA==",
      "dominantColor": "#f8e8e8",
      "bytes": 3438,
      "hash": "c777176fb6"
    },
    "gallery": [],
    "toConfirm": null
  },
  "te-pvc-pression": {
    "main": {
      "src": "/images/products/te-pvc-pression/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Té PVC pression gris",
      "source": "photo",
      "original": "photo-01.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAwAgCdASoMAAwAA4BaJZwAD4lwhQ8SxTQAAAD+9kqfX2sXmAQ0bECxjYIOxvVTgXxdQGJAa8P4mLQmbF88mUwve0EUiLQ7vm9NvQgA",
      "dominantColor": "#f8f8f8",
      "bytes": 22608,
      "hash": "822a7bb6fc"
    },
    "gallery": [
      {
        "src": "/images/products/te-pvc-pression/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Té PVC pression sur un établi, entouré de tubes PVC",
        "source": "photo",
        "original": "photo-01.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAAAwAgCdASoMAAwAA4BaJaACsAEfpuwe0+3DAAD2rsQlXbItvR1mkC6siNODPszBMOZ1Amlrl7lZB78PaSi+eYIxD3B4d3ynTS4AMJrfRPMYac8Sna+pR76D/wAAAA==",
        "dominantColor": "#080808",
        "bytes": 91638,
        "hash": "87b5354de5"
      }
    ],
    "toConfirm": null
  },
  "coude-pe-reseau-enterre": {
    "main": {
      "src": "/images/products/coude-pe-reseau-enterre/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Coude PE à compression pour réseau d'irrigation",
      "source": "photo",
      "original": "photo-04.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoMAAwAA4BaJZwAAuXjQmYAAP735qufOu0QxTehivcmF1UxsX8SNg7Vdmz1NgveAsAN8IBCUAA=",
      "dominantColor": "#f8f8f8",
      "bytes": 30126,
      "hash": "931b765fec"
    },
    "gallery": [
      {
        "src": "/images/products/coude-pe-reseau-enterre/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Coude PE posé dans un champ, raccordé à des tuyaux d'irrigation",
        "source": "photo",
        "original": "photo-04.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADQAQCdASoMAAwAA4BaJbACdAECoCuPAADiYg0Qya2gWDqR/1biIf6qH4mzZjKLS8ud8LQftnoUqwqCa69Bk5LmK/OivzuYFcN5cOGK2jqOp2R8bjMQAA==",
        "dominantColor": "#181808",
        "bytes": 135166,
        "hash": "22fc43b06c"
      }
    ],
    "toConfirm": "Même coude que le coude à compression : garder deux fiches ?"
  },
  "asperseur-impact": {
    "main": {
      "src": "/images/products/asperseur-impact/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Asperseur à impact vert, buse et ressort en laiton",
      "source": "photo",
      "original": "photo-27.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoMAAwAA4BaJQBYdiK3hMKAAAD+9kq1mUyOH1H6W3pRBdKPVScjuYbrl5Uq6qsGzcri6zV/sGmg+CwJJzyAAAAA",
      "dominantColor": "#f8f8f8",
      "bytes": 28690,
      "hash": "b468ca604b"
    },
    "gallery": [],
    "toConfirm": null
  },
  "asperseur-impact-orange": {
    "main": {
      "src": "/images/products/asperseur-impact-orange/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Asperseur à impact orange tenu en main",
      "source": "photo",
      "original": "photo-14.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwAQCdASoMAAwAA4BaJZgCdAEOLtxAAPysbA/jQVX0ztd2tQ03uQpPsILWtI16Le3TLKy705+GpEMugjfm/pa6Wk/pUn/AAAA=",
      "dominantColor": "#a8a8a8",
      "bytes": 78148,
      "hash": "e958b9de1a"
    },
    "gallery": [],
    "toConfirm": "Photo à refaire sans la main (fond uni)."
  },
  "micro-asperseur-piquet": {
    "main": {
      "src": "/images/products/micro-asperseur-piquet/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Micro-asperseur rotatif sur piquet, déflecteur orange",
      "source": "photo",
      "original": "photo-20.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACQAQCdASoMAAwAA4BaJZwAAltUK0AA/vfxNzpZkK0k6+pDwx+j9FL4F4r8ba0XZO/7sjXXL8M/oEs0oQAAAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 20604,
      "hash": "2577d8545e"
    },
    "gallery": [],
    "toConfirm": null
  },
  "mini-asperseur-piquet": {
    "main": {
      "src": "/images/products/mini-asperseur-piquet/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Mini-asperseur sur piquet bleu",
      "source": "photo",
      "original": "photo-22.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAACQAQCdASoMAAwAA4BaJZwAAlvvmwAA/vfxZUFLvJww8xCijk9nIWgjyLvhWsykAAA=",
      "dominantColor": "#f8f8f8",
      "bytes": 13396,
      "hash": "71e381ce0a"
    },
    "gallery": [],
    "toConfirm": null
  },
  "mini-vanne-16-ecrous": {
    "main": {
      "src": "/images/products/mini-vanne-16-ecrous/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Mini-vanne 16 mm à écrous verts, poignée bleue",
      "source": "photo",
      "original": "photo-35.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoMAAwAA4BaJZwCw7EOjc5JkQAA/vfminTGYMLhU9D55LuWbcDUd46M0sqqANH9lA8phAKwQ9CIAAAA",
      "dominantColor": "#f8f8f8",
      "bytes": 15412,
      "hash": "1dd860cfd6"
    },
    "gallery": [
      {
        "src": "/images/products/mini-vanne-16-ecrous/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Deux mini-vannes 16 mm, poignées bleue et verte",
        "source": "photo",
        "original": "photo-15.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoMAAwAA4BaJZwAAujGkVI2QAD+8/u0kBmzB3rLoZxPDLaJfbCW5sNFzZDF5LJ5QwIQL+xJTgYrQsRQUoX6OQenJDZSNC4mBAA=",
        "dominantColor": "#f8f8f8",
        "bytes": 27590,
        "hash": "3087b46654"
      },
      {
        "src": "/images/products/mini-vanne-16-ecrous/gallery-2.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Mini-vanne 16 mm à poignée et écrou verts",
        "source": "photo",
        "original": "photo-19.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoMAAwAA4BaJZwAAsf020mAAP73EWM7zq/u9yLf5rQ7uab9aPwNZgPya9P/Uyv23CAAAA==",
        "dominantColor": "#f8f8f8",
        "bytes": 11448,
        "hash": "5211c6d971"
      }
    ],
    "toConfirm": null
  },
  "mini-vanne-16-cannelee": {
    "main": {
      "src": "/images/products/mini-vanne-16-cannelee/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Mini-vanne 16 mm à embouts cannelés, poignée bleue",
      "source": "photo",
      "original": "photo-36.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAAAwAgCdASoMAAwAA4BaJZQCw7EPCFyM2H2gAAD+9+3BXyouFdiJBh4WaU/uHw+sR3Bfa4I++J1D05q5w+PIxJZ/wNHSwAAA",
      "dominantColor": "#f8f8f8",
      "bytes": 16776,
      "hash": "0b90ff9a8f"
    },
    "gallery": [],
    "toConfirm": null
  },
  "raccord-depart-gaine": {
    "main": {
      "src": "/images/products/raccord-depart-gaine/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Raccord de départ pour gaine goutte-à-goutte, écrou bleu",
      "source": "photo",
      "original": "photo-25.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoMAAwAA4BaJYwCdAD0ikMX9sAA/vfxLdJfyC67rBd8OoKaiSestx9ciRtoKY8B9SSyvd8jvKYAAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 20352,
      "hash": "8d0759cb82"
    },
    "gallery": [],
    "toConfirm": null
  },
  "raccord-gaine": {
    "main": {
      "src": "/images/products/raccord-gaine/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Raccord pour gaine goutte-à-goutte, écrous bleus",
      "source": "photo",
      "original": "photo-30.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoMAAwAA4BaJZQCw7DdKYPGAAD+9/FYm7cOb22ULqG6GnOT8YiZgUAQAv/aD5Ww3tdbkR06jAAAAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 16034,
      "hash": "207b563668"
    },
    "gallery": [],
    "toConfirm": null
  },
  "poincon-goutte-a-goutte": {
    "main": {
      "src": "/images/products/poincon-goutte-a-goutte/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Poinçon à poignée en T bleue pour percer les tuyaux",
      "source": "photo",
      "original": "photo-28.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADQAQCdASoMAAwAA4BaJQBdgB6RlwioAAD+9UnDni4ZM+NOfz872UJR+M51RZbmH2LkqTxFQdkmfzR6lpsbfqwAAAA=",
      "dominantColor": "#f8f8f8",
      "bytes": 14422,
      "hash": "b341539411"
    },
    "gallery": [],
    "toConfirm": null
  },
  "injecteur-venturi": {
    "main": {
      "src": "/images/products/injecteur-venturi/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Injecteur d'engrais Venturi avec tuyau d'aspiration transparent",
      "source": "photo",
      "original": "photo-23.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADwAQCdASoMAAwAA4BaJZwAAvrW59cdfYAA/vcU8aaYuNcnsH7mJKCk0T7bvOdvj3JmxnubNdVEYEwbSwBYixtpO4AAAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 55930,
      "hash": "5a523768dc"
    },
    "gallery": [],
    "toConfirm": null
  },
  "clapet-crepine-pvc": {
    "main": {
      "src": "/images/products/clapet-crepine-pvc/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Clapet crépine PVC gris à brides",
      "source": "photo",
      "original": "photo-21.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoMAAwAA4BaJZwAAlvLRC4AAP738APww2x7FxctwtFAl2N/QtqQCwn5WM00VXRUFnAgAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 26814,
      "hash": "b3b3d51fee"
    },
    "gallery": [],
    "toConfirm": null
  },
  "coffret-commande-pompe": {
    "main": {
      "src": "/images/products/coffret-commande-pompe/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Coffret de commande pour pompe immergée, interrupteur rouge et câble",
      "source": "photo",
      "original": "photo-32.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoMAAwAA4BaJZwAAtz9w8DwAAD+9xBWkylPw0ybf+ryOPwctN/EIxN+DzpGlCAA",
      "dominantColor": "#f8f8f8",
      "bytes": 39210,
      "hash": "ff25b91643"
    },
    "gallery": [
      {
        "src": "/images/products/coffret-commande-pompe/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Coffret de commande pour pompe immergée en main",
        "source": "photo",
        "original": "photo-26.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoMAAwAA4BaJYgCdADhfrwxGfAA/vGGviyQw0zT5ZjgMiBH/Y59dkQvFgs869DBDVhnm8Dq+EN/1a03D22XGSosxk097XhBk90oAA==",
        "dominantColor": "#d8d8c8",
        "bytes": 60960,
        "hash": "9cf502ee14"
      }
    ],
    "toConfirm": null
  },
  "debroussailleuse-thermique": {
    "main": {
      "src": "/images/products/debroussailleuse-thermique/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Débroussailleuse thermique avec guidon et harnais",
      "source": "photo",
      "original": "photo-37.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAQAgCdASoMAAwAA4BaJZwAD4WwcAK7KJWgAP736ZXCX5bE9y252jK5+v4Of3cpjBq/v+uJt0kVxA8lJvFwAA==",
      "dominantColor": "#f8f8f8",
      "bytes": 31736,
      "hash": "a1b25a5bc2"
    },
    "gallery": [
      {
        "src": "/images/products/debroussailleuse-thermique/gallery-1.webp",
        "width": 1200,
        "height": 1200,
        "alt": "Débroussailleuse livrée avec ses accessoires : lames, bobines, protections",
        "source": "photo",
        "original": "photo-34.jpg",
        "blurDataURL": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADQAQCdASoMAAwAA4BaJQBdgCHHW5eBgAD+4NsrS8N9ruFZpFYskPb1/xr4QMMFoqJhKUSYdSfTNuPEBzJnBvdkq4aYRRFD7d+8Pil66QOoQJHT7Z+o7fgA",
        "dominantColor": "#f8f8f8",
        "bytes": 70806,
        "hash": "389ce30530"
      }
    ],
    "toConfirm": null
  },
  "colle-pvc": {
    "main": {
      "src": "/images/products/colle-pvc/main.webp",
      "width": 1200,
      "height": 1200,
      "alt": "Flacon de colle PVC",
      "source": "photo",
      "original": "photo-16.jpg",
      "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADQAQCdASoMAAwAA4BaJYgCdACUjx1vvAD+r3AL3Eo0TuF33eo9/YW//C8bS9njSlRacd/DSCltV2DkjRiQJN9N0gA=",
      "dominantColor": "#a89898",
      "bytes": 108954,
      "hash": "c6aa698803"
    },
    "gallery": [],
    "toConfirm": "Photo à refaire sur fond uni."
  }
};
