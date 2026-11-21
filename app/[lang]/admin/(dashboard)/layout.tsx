import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDictionary } from "@/lib/i18n/server";

/**
 * L'espace d'administration est privé et dépend de la session : la navigation
 * n'a pas besoin d'être instantanée, on autorise donc un rendu bloquant.
 */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminDictionary();
  return { title: t.meta.admin, robots: { index: false, follow: false } };
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
