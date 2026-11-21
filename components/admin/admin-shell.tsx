"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import {
  ArrowUpRight,
  Gauge,
  Headset,
  Layers,
  LogOut,
  Menu,
  Settings,
  Tag,
} from "@/components/icons";
import { FlashToast } from "@/components/admin/flash-toast";
import { ToastProvider } from "@/components/ui/toast";
import { Logo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: Gauge },
  { href: "/admin/produits", label: "Produits", icon: Layers },
  { href: "/admin/categories", label: "Catégories", icon: Tag },
  { href: "/admin/demandes", label: "Demandes de devis", icon: Headset },
  { href: "/admin/reglages", label: "Réglages", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div lang="fr" dir="ltr" className="min-h-screen bg-soil-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-40 hidden h-screen flex-col bg-field-900 p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo tone="inverse" title="Saqia" className="h-8 w-auto" />
          <span className="sr-only">Administration</span>
        </Link>

        <nav className="mt-8 grid gap-1">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-soil-300/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-soil-300/80 transition hover:bg-white/5 hover:text-white"
          >
            Voir le site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <p className="truncate px-1 text-[11px] text-soil-300">
            Espace administrateur
          </p>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-soil-300/80 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div>
        <header className="sticky top-0 z-30 border-b border-soil-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo title="Saqia" className="h-7 w-auto" />
              <span className="text-sm font-semibold text-soil-600">Admin</span>
            </Link>
            <details className="relative">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-soil-300 text-soil-900">
                <Menu className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 top-11 w-60 rounded-2xl border border-soil-200 bg-white p-2 shadow-xl">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-soil-700 hover:bg-soil-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ToastProvider>
            {children}
            <Suspense fallback={null}>
              <FlashToast />
            </Suspense>
          </ToastProvider>
        </main>
      </div>
    </div>
  );
}
