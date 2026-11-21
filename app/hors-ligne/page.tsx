import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false, follow: false },
};

/**
 * Affichée par le service worker (public/sw.js) quand une page ne peut pas
 * être chargée faute de réseau. Page statique, sans données distantes.
 */
export default function HorsLignePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-soil-50 px-6 text-center">
      <Logo className="h-10 w-auto" />
      <div className="max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-soil-900">Vous êtes hors ligne</h1>
        <p className="mt-2 text-soil-700">
          Vérifiez votre connexion, puis réessayez. Vous pouvez aussi nous appeler au {siteConfig.phoneDisplay}.
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- rechargement complet voulu : la page doit revenir du réseau. */}
      <a href="/" className="inline-flex min-h-12 items-center rounded-full bg-field-900 px-6 text-sm font-semibold text-white">
        Réessayer
      </a>
    </main>
  );
}
