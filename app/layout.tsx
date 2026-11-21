import { ClickTracker } from "@/components/click-tracker";
import { Motion } from "@/components/motion";
import { WhatsappProvider } from "@/components/whatsapp-provider";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: `${siteConfig.name} — ${siteConfig.slogan} Pompes, raccords et irrigation`,
  description:
    "Pompes centrifuges et immergées, raccords PE/PVC et kits d'irrigation pour les professionnels agricoles. Conseil technique et devis sous 24h.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Numéro WhatsApp des réglages de l'admin, pour tous les liens du site.
  const settings = await getSiteSettings();
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <WhatsappProvider number={settings.whatsappNumber} brandName={settings.name}>
          {children}
          <ClickTracker />
          <Motion />
        </WhatsappProvider>
      </body>
    </html>
  );
}
