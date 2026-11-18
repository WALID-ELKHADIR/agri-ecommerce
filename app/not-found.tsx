import Link from "next/link";
import { ArrowRight, Droplet, Search } from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 items-center bg-[#f5f8fb] pb-24 pt-16 md:pb-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0E7490] text-white shadow-lg shadow-[#0A2540]/20">
            <Droplet className="h-7 w-7" />
          </span>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Erreur 404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
            Cette page n’existe pas
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            La référence recherchée a peut-être été renommée ou retirée du
            catalogue. Utilisez la recherche ou parcourez nos gammes.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/produits"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A2540] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F3557]"
            >
              <Search className="h-4 w-4" />
              Voir le catalogue
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0A2540] transition hover:border-cyan-300"
            >
              Retour à l’accueil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileCta />
    </>
  );
}
