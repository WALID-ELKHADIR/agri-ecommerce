"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Clock,
  MapPin,
  Menu,
  Phone,
  Search,
  WhatsApp,
} from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { catalogHref } from "@/lib/catalog-query";
import { BRAND, generalMessage } from "@/lib/catalog";
import { QuoteCounter } from "@/components/quote-list/quote-counter";
import { QuoteDrawer } from "@/components/quote-list/quote-drawer";
import { Sheet } from "@/components/ui/dialog";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { LangSwitcher } from "@/components/i18n/lang-switcher";
import { T } from "@/components/i18n/t";
import { useLocale } from "@/components/i18n/locale-provider";
import type { TextKey } from "@/lib/i18n/fr";

const links: { href: string; label: TextKey }[] = [
  { href: "/", label: "navHome" },
  { href: "/produits", label: "navProducts" },
  { href: "/#categories", label: "navCategories" },
  { href: "/#services", label: "navServices" },
  { href: "/contact", label: "navContact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

  function handleChange(value: string) {
    setTerm(value);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    router.push(catalogHref({ q: term.trim().slice(0, 80) }));
    setOpen(false);
  }

  return (
    <>
      <div className="bg-field-900 text-soil-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:text-xs">
          <p className="flex items-center gap-2 font-medium">
            <Clock className="h-3.5 w-3.5 text-water-400" />
            <span className="hidden sm:inline">
              <T k="topbarLong" />
            </span>
            <span className="sm:hidden">
              <T k="topbarShort" />
            </span>
          </p>
          <div className="flex items-center gap-4">
            <span lang="fr" dir="ltr" className="hidden items-center gap-1.5 text-soil-300/80 md:flex">
              <MapPin className="h-3.5 w-3.5 text-water-400" />
              {BRAND.address}
            </span>
            <a
              href={`tel:${BRAND.phoneRaw}`}
              dir="ltr"
              className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] flex items-center gap-1.5 font-semibold text-white transition hover:text-water-300"
            >
              <Phone className="h-3.5 w-3.5 text-water-400" />
              {BRAND.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <header className="site-header-shell sticky top-0 z-50 border-b border-soil-200/80 bg-soil-50/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" aria-label={t.homeLabel} className="flex min-h-11 items-center">
            <Logo className="site-header-logo h-9 w-auto" animated={pathname === "/"} />
          </Link>

          <nav className="ms-6 hidden items-center gap-0.5 lg:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : link.href === "/produits"
                    ? pathname.startsWith("/produits")
                    : link.href === "/contact"
                      ? pathname === "/contact"
                      : false;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-field-900 text-white"
                      : "text-soil-600 hover:bg-soil-900/5 hover:text-soil-900"
                  }`}
                >
                  <T k={link.label} />
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <LangSwitcher />
            <form
              onSubmit={submitSearch}
              className="hidden items-center gap-2 rounded-full border border-soil-300/80 bg-white px-3.5 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-water-600 lg:flex"
              role="search"
            >
              <Search className="h-4 w-4 text-soil-500" />
              <label htmlFor="header-search" className="sr-only">
                <T k="searchLabel" />
              </label>
              <input
                id="header-search"
                value={term}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-36 bg-transparent text-sm text-soil-900 placeholder:text-soil-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-6 w-6 items-center justify-center rounded-full text-soil-500 transition hover:bg-soil-100 hover:text-soil-900"
                aria-label={t.searchSubmit}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <WhatsAppLink
              source="header"
              message={generalMessage()}
              className="wa-pulse hidden items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-whatsapp-hover sm:inline-flex"
            >
              <WhatsApp className="h-4 w-4" />
              <T k="quoteWhatsapp" />
            </WhatsAppLink>

            <QuoteCounter />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-soil-300/80 bg-white text-soil-900 transition hover:bg-soil-50 lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={t.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

      </header>
      {/* Menu mobile : tiroir latéral animé (Sheet natif <dialog>). */}
      <Sheet side="right" open={open} onClose={() => setOpen(false)} title={t.menu}>
          <div id="mobile-menu">
            <form
              onSubmit={submitSearch}
              className="flex min-h-11 items-center gap-2 rounded-2xl border border-soil-300/80 bg-white px-3.5 py-2.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-water-600"
              role="search"
            >
              <Search className="h-4 w-4 text-soil-500" />
              <label htmlFor="mobile-search" className="sr-only">
                <T k="searchLabel" />
              </label>
              <input
                id="mobile-search"
                value={term}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={t.searchMobilePlaceholder}
                className="w-full bg-transparent text-sm text-soil-900 placeholder:text-soil-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-field-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                <T k="searchOk" />
              </button>
            </form>

            <nav className="mt-3 grid gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-soil-700 transition hover:bg-soil-900/5"
                >
                  <T k={link.label} />
                  <ArrowRight className="h-4 w-4 text-soil-500 rtl:rotate-180" />
                </Link>
              ))}
            </nav>

            <div className="mt-3 grid gap-2">
              <WhatsAppLink
                source="header"
                message={generalMessage()}
                className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-sm font-semibold text-white"
              >
                <WhatsApp className="h-4 w-4" />
                <T k="requestQuote" />
              </WhatsAppLink>
              <a
                href={`tel:${BRAND.phoneRaw}`}
              dir="ltr"
                className="flex items-center justify-center gap-2 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900"
              >
                <Phone className="h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </div>
          </div>
      </Sheet>
      <QuoteDrawer />
    </>
  );
}
