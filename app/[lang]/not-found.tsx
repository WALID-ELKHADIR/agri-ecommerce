import Link from "next/link";
import { ArrowRight, Droplet, Search } from "@/components/icons";
import { MobileCta } from "@/components/mobile-cta";
import { SiteFooterWithSettings } from "@/components/site-footer-server";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = (await getDictionary()).notFoundPage;
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 items-center bg-soil-50 pb-24 pt-16 md:pb-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-field-900 to-water-600 text-white shadow-lg shadow-soil-900/20">
            <Droplet className="h-7 w-7" />
          </span>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-water-700">
            {t.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-soil-600">
            {t.text}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/produits"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-field-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-field-800"
            >
              <Search className="h-4 w-4" />
              {t.catalog}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-soil-300 bg-white px-5 py-3 text-sm font-semibold text-soil-900 transition hover:border-water-300"
            >
              {t.home}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooterWithSettings />
      <MobileCta />
    </>
  );
}
