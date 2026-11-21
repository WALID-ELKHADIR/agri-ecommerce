import { ClickTracker } from "@/components/click-tracker";
import { Motion } from "@/components/motion";
import { SwRegister } from "@/components/sw-register";
import { WhatsappProvider } from "@/components/whatsapp-provider";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_LOCALE, direction } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Police display de la marque Saqia (titres, wordmark). */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

/** Police arabe : chargée seulement quand un texte arabe s'affiche (pas de préchargement). */
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.slogan} Pompes, raccords et irrigation`,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  description:
    "Pompes centrifuges et immergées, raccords PE/PVC et kits d'irrigation pour les professionnels agricoles. Conseil technique et devis sous 24h.",
};

/**
 * Exécuté avant le premier affichage :
 * - langue choisie (cookie « saqia-lang ») : <html lang dir> posés tout de suite,
 *   donc ni saut ni mauvais sens de lecture (jamais sur l'admin, en français) ;
 * - tracé du logo une seule fois par visite.
 */
const BOOT_SCRIPT =
  "try{if(location.pathname.indexOf('/admin')!==0&&/(?:^|; )saqia-lang=ar(?:;|$)/.test(document.cookie)){document.documentElement.lang='ar';document.documentElement.dir='rtl'}}catch(e){}" +
  "try{var k='saqia:logo-vu';if(sessionStorage.getItem(k)){document.documentElement.setAttribute('data-logo-seen','')}else{sessionStorage.setItem(k,'1');setTimeout(function(){document.documentElement.setAttribute('data-logo-seen','')},1200)}}catch(e){}";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Numéro WhatsApp des réglages de l'admin, pour tous les liens du site.
  const settings = await getSiteSettings();
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={direction(DEFAULT_LOCALE)}
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${notoArabic.variable} h-full antialiased`}
      // data-logo-seen est posé par le script ci-dessous avant l'hydratation.
      suppressHydrationWarning
    >
      <head>
        {/* Tracé du logo une seule fois par visite : décidé avant le premier rendu,
            l'attribut de <html> survit aux navigations côté client. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <WhatsappProvider number={settings.whatsappNumber} brandName={settings.name}>
          {children}
          <ClickTracker />
          <Motion />
          <SwRegister />
        </WhatsappProvider>
      </body>
    </html>
  );
}
