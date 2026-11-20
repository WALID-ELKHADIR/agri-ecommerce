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
  X,
} from "@/components/icons";
import { Logo } from "@/components/brand/logo";
import { catalogFilters } from "@/lib/catalog-filters";
import { BRAND, generalMessage, whatsappLink } from "@/lib/catalog";
import { WhatsAppLink } from "@/components/whatsapp-link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/#categories", label: "Catégories" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(value: string) {
    setTerm(value);
    if (pathname === "/produits") {
      catalogFilters.setQuery(value);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    catalogFilters.set({ query: term.trim(), category: "all" });
    router.push("/produits");
    setOpen(false);
  }

  return (
    <>
      <div className="bg-field-900 text-soil-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:text-xs">
          <p className="flex items-center gap-2 font-medium">
            <Clock className="h-3.5 w-3.5 text-water-400" />
            <span className="hidden sm:inline">Conseil technique &amp; devis sous 24h</span>
            <span className="sm:hidden">Devis sous 24h</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-soil-300/80 md:flex">
              <MapPin className="h-3.5 w-3.5 text-water-400" />
              {BRAND.address}
            </span>
            <a
              href={`tel:${BRAND.phoneRaw}`}
              className="relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] flex items-center gap-1.5 font-semibold text-white transition hover:text-water-300"
            >
              <Phone className="h-3.5 w-3.5 text-water-400" />
              {BRAND.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-soil-200/80 bg-soil-50/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" aria-label="Saqia — accueil" className="flex min-h-11 items-center">
            <Logo className="h-9 w-auto" />
          </Link>

          <nav className="ml-6 hidden items-center gap-0.5 lg:flex">
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
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form
              onSubmit={submitSearch}
              className="hidden items-center gap-2 rounded-full border border-soil-300/80 bg-white px-3.5 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-water-600 lg:flex"
              role="search"
            >
              <Search className="h-4 w-4 text-soil-500" />
              <label htmlFor="header-search" className="sr-only">
                Rechercher un produit
              </label>
              <input
                id="header-search"
                value={term}
                onChange={(event) => handleChange(event.target.value)}
                placeholder="Pompe, raccord, Ø…"
                className="w-36 bg-transparent text-sm text-soil-900 placeholder:text-soil-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-6 w-6 items-center justify-center rounded-full text-soil-500 transition hover:bg-soil-100 hover:text-soil-900"
                aria-label="Lancer la recherche"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <WhatsAppLink
 href={whatsappLink(generalMessage())}
 source="header"
 message={generalMessage()}
 className="hidden items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-whatsapp-hover sm:inline-flex"
 >
              <WhatsApp className="h-4 w-4" />
              Devis WhatsApp
            </WhatsAppLink>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-soil-300/80 bg-white text-soil-900 transition hover:bg-soil-50 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div
            id="mobile-menu"
            className="border-t border-soil-200 bg-soil-50 px-4 pb-4 pt-3 lg:hidden"
          >
            <form
              onSubmit={submitSearch}
              className="flex min-h-11 items-center gap-2 rounded-2xl border border-soil-300/80 bg-white px-3.5 py-2.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-water-600"
              role="search"
            >
              <Search className="h-4 w-4 text-soil-500" />
              <label htmlFor="mobile-search" className="sr-only">
                Rechercher un produit
              </label>
              <input
                id="mobile-search"
                value={term}
                onChange={(event) => handleChange(event.target.value)}
                placeholder="Rechercher un produit…"
                className="w-full bg-transparent text-sm text-soil-900 placeholder:text-soil-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-field-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                OK
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
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-soil-500" />
                </Link>
              ))}
            </nav>

            <div className="mt-3 grid gap-2">
              <WhatsAppLink
 href={whatsappLink(generalMessage())}
 source="header"
 message={generalMessage()}
 className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-sm font-semibold text-white"
 >
                <WhatsApp className="h-4 w-4" />
                Demander un devis
              </WhatsAppLink>
              <a
                href={`tel:${BRAND.phoneRaw}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-soil-300 bg-white px-4 py-3 text-sm font-semibold text-soil-900"
              >
                <Phone className="h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
