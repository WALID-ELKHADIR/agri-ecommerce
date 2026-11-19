export function FormSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-[28rem] animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">Chargement du formulaire…</span>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">Chargement de la liste…</span>
    </div>
  );
}
