import Link from "next/link";
import { ShieldAlert, AlertTriangle } from "lucide-react";

import { Button } from "@/src/components/ui/button";

/**
 * 403 panel for a route the role may not access (app-shell §6 permission-denied).
 * The item is also absent from the nav; this covers a direct URL hit.
 */
export function ForbiddenPanel() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">No access</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don&apos;t have permission to view this area.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/admin/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}

/**
 * In-content error state with retry (app-shell §6 error). Used by the route error
 * boundary (error.tsx) and any async region that fails.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-[var(--status-danger)]">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
