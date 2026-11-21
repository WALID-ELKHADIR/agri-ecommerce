"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Database } from "@/components/icons";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminDictionary } from "@/components/admin/use-admin-dictionary";

/** Erreur inattendue dans l'espace d'administration : on explique et on propose de réessayer. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useAdminDictionary();
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <EmptyState
      icon={<Database className="h-5 w-5" />}
      title={t.error.title}
      description={t.error.text}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>{t.common.retry}</Button>
          <Link href="/admin" className={buttonClasses({ variant: "secondary" })}>
            {t.nav.dashboard}
          </Link>
        </div>
      }
    />
  );
}
