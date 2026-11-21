import { Suspense } from "react";
import { DashboardContent } from "@/components/admin/dashboard";
import { DashboardSkeleton } from "@/components/admin/skeletons";

export default function AdminHomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
