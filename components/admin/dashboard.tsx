import Link from "next/link";
import { ArrowRight, ArrowUpRight, Database, Plus } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats, listQuoteRequests } from "@/lib/admin-data";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export function SetupNotice({ error }: { error?: string | null }) {
  if (isSupabaseConfigured() && !error) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-harvest-200 bg-harvest-50 p-4 text-sm text-harvest-900">
      <p className="flex items-center gap-2 font-semibold">
        <Database className="h-4 w-4" />
        Base de données à initialiser
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed">
        <li>
          Ouvrez votre projet Supabase → <strong>SQL Editor</strong>.
        </li>
        <li>
          Collez le contenu de{" "}
          <code className="rounded bg-harvest-100 px-1">
            supabase/migrations/20261118000000_init.sql
          </code>{" "}
          puis exécutez-le.
        </li>
        <li>
          Créez un utilisateur dans <strong>Authentication → Users</strong> pour
          vous connecter à cet espace.
        </li>
      </ol>
      {error ? (
        <p className="mt-2 text-[11px] text-harvest-800">Détail : {error}</p>
      ) : null}
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-soil-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-soil-500">{description}</p>
      </div>

      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-field-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-field-800"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soil-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-soil-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-soil-500">{hint}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-2xl border border-soil-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-water-200 hover:shadow-md"
      >
        {content}
        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-water-700">
          Ouvrir
          <ArrowUpRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </span>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-soil-200 bg-white p-5">{content}</div>
  );
}

export async function DashboardContent() {
  await requireAdmin();

  const [stats, quotes] = await Promise.all([
    getAdminStats(),
    listQuoteRequests(),
  ]);

  return (
    <div className="space-y-5">
      <SetupNotice error={quotes.error} />

      <AdminHeader
        title="Tableau de bord"
        description="Vue d’ensemble du catalogue et des demandes de devis."
        action={{ href: "/admin/produits/nouveau", label: "Nouveau produit" }}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produits"
          value={stats.products}
          hint="Références au total"
          href="/admin/produits"
        />
        <StatCard
          label="En ligne"
          value={stats.published}
          hint="Visibles sur le site"
          href="/admin/produits"
        />
        <StatCard
          label="Demandes"
          value={stats.quotes}
          hint="Depuis le lancement"
          href="/admin/demandes"
        />
        <StatCard
          label="À traiter"
          value={stats.pending}
          hint="Nouvelles demandes"
          href="/admin/demandes"
        />
      </div>

      <section className="rounded-2xl border border-soil-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-soil-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-soil-900">
            Dernières demandes
          </h2>
          <Link
            href="/admin/demandes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-water-700 hover:text-water-800"
          >
            Tout voir
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {quotes.quotes.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-soil-500">
            Aucune demande enregistrée pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-soil-100">
            {quotes.quotes.slice(0, 5).map((quote) => (
              <li
                key={quote.id}
                className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-soil-900">
                    {quote.name || quote.phone || quote.email || "Visiteur"}
                  </p>
                  <p className="truncate text-xs text-soil-500">
                    {quote.productSlug ?? quote.profile ?? quote.source}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-soil-500">
                  {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
