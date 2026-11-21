import Link from "next/link";
import { ArrowRight, Droplet, Search } from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { SiteFooterWithSettings } from "@/components/site-footer-server";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main lang="fr" dir="ltr" className="flex flex-1 items-center bg-soil-50 pb-24 pt-16 md:pb-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-field-900 to-water-600 text-white shadow-lg shadow-soil-900/20">
            <Droplet className="h-7 w-7" />
          </span>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
            Erreur 404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
            Cette page n’existe pas
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-soil-600">
            La référence recherchée a peut-être été renommée ou retirée du
            catalogue. Utilisez la recherche ou parcourez nos gammes.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/produits"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-field-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-field-800"
            >
              <Search className="h-4 w-4" />
              Voir le catalogue
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-soil-300 bg-white px-5 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300"
            >
              Retour à l’accueil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooterWithSettings />
      <MobileCta />
    </>
  );
}
