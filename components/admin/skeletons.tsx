"use client";

import { useAdminDictionary } from "@/components/admin/use-admin-dictionary";

export function FormSkeleton() {
  const t = useAdminDictionary();
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-soil-200" />
      <div className="h-[28rem] animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">{t.common.loadingForm}</span>
    </div>
  );
}

export function TableSkeleton() {
  const t = useAdminDictionary();
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-soil-200" />
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">{t.common.loadingList}</span>
    </div>
  );
}

export function DashboardSkeleton() {
  const t = useAdminDictionary();
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-soil-200" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">{t.common.loadingDashboard}</span>
    </div>
  );
}
