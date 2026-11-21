"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Database } from "@/components/icons";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/** Erreur inattendue dans l'espace d'administration : on explique et on propose de réessayer. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <EmptyState
      icon={<Database className="h-5 w-5" />}
      title="Cette page n'a pas pu se charger"
      description="La base de données n'a pas répondu ou une migration manque. Réessayez ; si l'erreur persiste, vérifiez que toutes les migrations Supabase sont appliquées."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>Réessayer</Button>
          <Link href="/admin" className={buttonClasses({ variant: "secondary" })}>
            Tableau de bord
          </Link>
        </div>
      }
    />
  );
}
