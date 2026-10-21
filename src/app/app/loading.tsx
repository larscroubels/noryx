import { Skeleton } from "@/components/ui/feedback";

import { getT } from "@/i18n/server";

export default async function WorkspaceLoading() {
  const t = await getT();
  return (
    <div className="grid gap-8" aria-busy="true" aria-label={t.common.loading}>
      <div className="grid gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
