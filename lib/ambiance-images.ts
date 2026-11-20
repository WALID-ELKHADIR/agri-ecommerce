// Fichier généré par scripts/images/process-ambiance.ts — ne pas modifier à la main.
// Photos d'ambiance libres de droits (hero, sections, catégories), à remplacer
// par des photos de terrain. Crédits : public/images/_archive/2026-11-stock-unsplash/.

export type AmbianceImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  source: "stock";
  credit: { author: string; url: string; license: "Unsplash License" };
  blurDataURL: string;
  dominantColor: string;
  bytes: number;
  hash: string;
};

export type AmbianceKey = "heroDesktop" | "heroMobile" | "goutteAGoutte" | "vergers" | "serres" | "categorieArrosage";

export const AMBIANCE_IMAGES: Record<AmbianceKey, AmbianceImage> = {
  "heroDesktop": {
    "src": "/images/hero/home.webp",
    "width": 1920,
    "height": 1080,
    "alt": "Jeune laitue au pied d'un tuyau de goutte-à-goutte, dans une terre ocre",
    "source": "stock",
    "credit": {
      "author": "Nebular",
      "url": "https://unsplash.com/photos/a-plant-sprouting-from-a-soil-eeN3zSBlaaA",
      "license": "Unsplash License"
    },
    "blurDataURL": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwAQCdASoQAAkAA4BaJZgCdACvaDSQAP69stbtKRGw0YWBajlQ/IvrHfnlDFCvCNHMV7fv8dohTK0XL1bzPSAHRY3aOkTddvt3TmVk4zRH2qvroAA=",
    "dominantColor": "#584838",
    "bytes": 128440,
    "hash": "a407d6a99c"
  },
  "heroMobile": {
    "src": "/images/hero/home-mobile.webp",
    "width": 1080,
    "height": 1350,
    "alt": "Jeune laitue au pied d'un tuyau de goutte-à-goutte, dans une terre ocre",
    "source": "stock",
    "credit": {
      "author": "Nebular",
      "url": "https://unsplash.com/photos/a-plant-sprouting-from-a-soil-eeN3zSBlaaA",
      "license": "Unsplash License"
    },
    "blurDataURL": "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAADwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdMoACrJZGC1TL2QegAP66G1q7TpxJneTJDqLGfi/5f7wgjdd5OhACZFBqY51trVdhXTg/Kh1NIWOOj4C91nCvSlIEfn2qt2VzGy9KhktwTYNv+je0Vl9VhlbdzWMVdmcAAAA=",
    "dominantColor": "#584838",
    "bytes": 91292,
    "hash": "ed770811f8"
  },
  "goutteAGoutte": {
    "src": "/images/sections/goutte-a-goutte.webp",
    "width": 1600,
    "height": 900,
    "alt": "Rangées de jeunes plants irriguées par des lignes de goutte-à-goutte",
    "source": "stock",
    "credit": {
      "author": "Anil Sharma",
      "url": "https://unsplash.com/photos/a-bunch-of-plants-that-are-in-the-dirt-U5w3Z7fAy5Y",
      "license": "Unsplash License"
    },
    "blurDataURL": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAkAA4BaJYwCsAD2OUYRMAD+gg0KxvfgX3s8gXsyToVVfN387Y+vgzqC0g4UfLuQchOAC+8EQAAA",
    "dominantColor": "#685848",
    "bytes": 142140,
    "hash": "f601314d37"
  },
  "vergers": {
    "src": "/images/sections/vergers.webp",
    "width": 1600,
    "height": 900,
    "alt": "Orangers chargés de fruits dans un verger",
    "source": "stock",
    "credit": {
      "author": "nhxl bdl",
      "url": "https://unsplash.com/photos/ripe-oranges-hanging-from-lush-green-trees-in-an-orchard-ka_OiW3I_uE",
      "license": "Unsplash License"
    },
    "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAACwAQCdASoQAAkAA4BaJYgAAhcHR2GyAP7tHZFdJ43KWgyM91TgeBqkoPC/H+LPaCNIPL4dZrJTGVqtrAxCYB29sl+ho4ADgT2HAAAA",
    "dominantColor": "#181808",
    "bytes": 157788,
    "hash": "b041f9b9f5"
  },
  "serres": {
    "src": "/images/sections/serres.webp",
    "width": 1600,
    "height": 900,
    "alt": "Grande serre tunnel avec des cultures en rangs",
    "source": "stock",
    "credit": {
      "author": "wei",
      "url": "https://unsplash.com/photos/a-large-greenhouse-filled-with-lots-of-green-plants-eoj6t-cMtNs",
      "license": "Unsplash License"
    },
    "blurDataURL": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACQAQCdASoQAAkAA4BaJbAAAZC+zoAA/tYNIX35MgkO7KxQK62Esl3CmqncmiMy2sLpcTiLW7nqcyRj9fgpunx4/pJKfCwA",
    "dominantColor": "#d8d8d8",
    "bytes": 203246,
    "hash": "33bb0ef239"
  },
  "categorieArrosage": {
    "src": "/images/categories/arrosage.webp",
    "width": 1200,
    "height": 900,
    "alt": "Asperseurs arrosant un champ",
    "source": "stock",
    "credit": {
      "author": "Being Organic in EU",
      "url": "https://unsplash.com/photos/two-sprinklers-spraying-water-on-a-corn-field-ZYiOik4jels",
      "license": "Unsplash License"
    },
    "blurDataURL": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAwAA4BaJaACdAELMkm0oAD8jI90G+/JyGXCLCh3S8yz+Pi6mIHgwivC7J1kjTb6GorwAAA=",
    "dominantColor": "#888858",
    "bytes": 113958,
    "hash": "6d4e2b02ab"
  }
};
