"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

/**
 * Affiche une notification après une action de l'admin, à partir des
 * paramètres posés par la Server Action (`?ok=…` ou `?error=…`), puis les
 * retire de l'URL pour qu'un rechargement ne la réaffiche pas.
 */
export function FlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  useEffect(() => {
    const ok = params.get("ok");
    const error = params.get("error");
    if (!ok && !error) return;

    if (ok) toast({ title: ok === "1" ? "Modifications enregistrées." : ok });
    if (error) toast({ tone: "error", title: "Action impossible", description: error });

    const next = new URLSearchParams(params);
    next.delete("ok");
    next.delete("error");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router, toast]);

  return null;
}
