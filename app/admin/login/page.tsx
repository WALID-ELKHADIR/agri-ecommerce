import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { ArrowLeft, ShieldCheck, WhatsApp } from "@/components/icons";
import { signInAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Connexion — Administration Saqia",
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
  unavailable:
    "Impossible de vérifier vos droits pour le moment. Réessayez dans un instant ; si le problème persiste, vérifiez que les migrations Supabase sont appliquées.",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-field-900 px-4 py-10">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-water-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-water-400/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5">
          <Logo tone="inverse" title="Saqia, administration" className="h-10 w-auto" />
        </div>

        <Suspense fallback={<LoginCard />}>
          {searchParams.then((params) => (
            <LoginCard
              error={params.error ? errors[params.error] ?? errors.invalid : null}
              next={params.next}
            />
          ))}
        </Suspense>

        <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-soil-300/70">
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au site
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-water-400" />
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
      <h1 className="text-lg font-semibold text-soil-900">Connexion</h1>
      <p className="mt-1 text-xs text-soil-500">
        Gérez le catalogue et les demandes de devis.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-medium text-danger-700"
        >
          {error}
        </p>
      ) : null}

      {!configured ? (
        <div className="mt-4 rounded-xl border border-harvest-200 bg-harvest-50 px-3.5 py-3 text-xs leading-relaxed text-harvest-800">
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

        <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="vous@entreprise.ma"
            className="w-full rounded-xl border border-soil-300 px-3.5 py-2.5 text-sm font-normal text-soil-900 placeholder:text-soil-500 focus:border-water-500 focus:outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-soil-600">
          Mot de passe
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-soil-300 px-3.5 py-2.5 text-sm font-normal text-soil-900 placeholder:text-soil-500 focus:border-water-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-field-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-field-800"
        >
          Se connecter
        </button>
      </form>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-soil-500">
        <WhatsApp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Les demandes envoyées depuis le site arrivent aussi sur WhatsApp.
      </p>
    </div>
  );
}
