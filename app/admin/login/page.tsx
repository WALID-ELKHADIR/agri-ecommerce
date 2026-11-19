import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Droplet, ShieldCheck, WhatsApp } from "@/components/icons";
import { signInAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Connexion — Administration AgriFlow",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const errors: Record<string, string> = {
  missing: "Renseignez votre e-mail et votre mot de passe.",
  invalid: "E-mail ou mot de passe incorrect.",
  config: "Supabase n’est pas encore configuré sur ce projet.",
  forbidden: "Ce compte n’a pas accès à l’administration.",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A2540] px-4 py-10">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-[#0A2540] shadow-lg shadow-cyan-900/30">
            <Droplet className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold text-white">AgriFlow</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
              Administration
            </span>
          </span>
        </div>

        <Suspense fallback={<LoginCard />}>
          {searchParams.then((params) => (
            <LoginCard
              error={params.error ? errors[params.error] ?? errors.invalid : null}
              next={params.next}
            />
          ))}
        </Suspense>

        <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-slate-300/70">
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au site
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            Accès réservé
          </span>
        </div>
      </div>
    </div>
  );
}

function LoginCard({
  error,
  next,
}: {
  error?: string | null;
  next?: string;
}) {
  const configured = isSupabaseConfigured();

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30">
      <h1 className="text-lg font-semibold text-[#0A2540]">Connexion</h1>
      <p className="mt-1 text-xs text-slate-500">
        Gérez le catalogue et les demandes de devis.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {!configured ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800">
          <p className="font-semibold">Configuration requise</p>
          <p className="mt-1">
            Ajoutez <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans{" "}
            <code>.env.local</code>, puis exécutez{" "}
            <code>supabase/migrations/20261118000000_init.sql</code> dans
            Supabase.
          </p>
        </div>
      ) : null}

      <form action={signInAction} className="mt-5 grid gap-3">
        <input type="hidden" name="next" value={next ?? "/admin"} />

        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="vous@entreprise.ma"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal text-[#0A2540] placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal text-[#0A2540] placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0F3557]"
        >
          Se connecter
        </button>
      </form>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
        <WhatsApp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Les demandes envoyées depuis le site arrivent aussi sur WhatsApp.
      </p>
    </div>
  );
}
