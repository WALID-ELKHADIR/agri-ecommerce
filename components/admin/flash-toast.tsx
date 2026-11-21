"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminDictionary } from "@/components/admin/use-admin-dictionary";
import { useToast } from "@/components/ui/toast";
import { flashText } from "@/lib/i18n/flash";

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
  const { flash } = useAdminDictionary();

  useEffect(() => {
    const ok = params.get("ok");
    const error = params.get("error");
    if (!ok && !error) return;

    if (ok) toast({ title: flashText(flash, ok) });
    if (error) toast({ tone: "error", title: flash.failedTitle, description: flashText(flash, error) });

    const next = new URLSearchParams(params);
    next.delete("ok");
    next.delete("error");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router, toast, flash]);

  return null;
}
