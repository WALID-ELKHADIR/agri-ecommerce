import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * L'espace d'administration est privé et dépend de la session : la navigation
 * n'a pas besoin d'être instantanée, on autorise donc un rendu bloquant.
 */
export const instant = false;

export const metadata = {
  title: "Administration — AgriFlow",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
