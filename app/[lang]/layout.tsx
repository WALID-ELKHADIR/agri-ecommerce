import { ClickTracker } from "@/components/click-tracker";
import { Motion } from "@/components/motion";
import { SwRegister } from "@/components/sw-register";
import { WhatsappProvider } from "@/components/whatsapp-provider";
import { siteConfig } from "@/lib/site-config";
import { direction } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { isLocale, LOCALES } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import "../globals.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: { default: t.meta.defaultTitle, template: `%s | ${siteConfig.name}` },
    applicationName: siteConfig.name,
    description: t.meta.defaultDescription,
  };
}

/** Exécuté avant le premier affichage : tracé du logo une seule fois par visite. */
const BOOT_SCRIPT =
  "try{var k='saqia:logo-vu';if(sessionStorage.getItem(k)){document.documentElement.setAttribute('data-logo-seen','')}else{sessionStorage.setItem(k,'1');setTimeout(function(){document.documentElement.setAttribute('data-logo-seen','')},1200)}}catch(e){}";

/** Les deux langues sont pré-générées ; le proxy sert l'une ou l'autre selon le cookie. */
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  // Numéro WhatsApp des réglages de l'admin, pour tous les liens du site.
  const settings = await getSiteSettings();
  return (
    <html
      lang={locale}
      dir={direction(locale)}
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
        <LocaleProvider locale={locale}>
          <WhatsappProvider number={settings.whatsappNumber} brandName={settings.name}>
            {children}
            <ClickTracker />
            <Motion />
            <SwRegister />
          </WhatsappProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
