import { Skeleton } from "@/src/components/ui/skeleton";

// Route-loading skeleton in the content area; the shell chrome stays put (app-shell §6).
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}
