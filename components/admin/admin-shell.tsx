"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Droplet,
  Gauge,
  Headset,
  Layers,
  LogOut,
  Menu,
} from "@/components/icons";
import { signOutAction } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: Gauge },
  { href: "/admin/produits", label: "Produits", icon: Layers },
  { href: "/admin/demandes", label: "Demandes de devis", icon: Headset },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#eef2f7] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-40 hidden h-screen flex-col bg-[#0A2540] p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-[#0A2540]">
            <Droplet className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-white">Saqia</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
              Administration
            </span>
          </span>
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
                    : "text-slate-300/80 hover:bg-white/5 hover:text-white"
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
            className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300/80 transition hover:bg-white/5 hover:text-white"
          >
            Voir le site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <p className="truncate px-1 text-[11px] text-slate-400">
            Espace administrateur
          </p>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300/80 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A2540] text-cyan-300">
                <Droplet className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-[#0A2540]">
                Saqia <span className="text-cyan-700">Admin</span>
              </span>
            </Link>
            <details className="relative">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-300 text-[#0A2540]">
                <Menu className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 top-11 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
