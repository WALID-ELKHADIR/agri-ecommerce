import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/** Application installable : nom, couleurs de la marque et icônes existantes. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Pompes & irrigation`,
    short_name: siteConfig.name,
    description: "Pompes, raccords et kits d'irrigation au Maroc. Devis gratuit sur WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "fr",
    dir: "ltr",
    theme_color: "#1a2c18",
    background_color: "#faf8f3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
