"use client";

import { ErrorState } from "@/src/components/admin/shell-states";

// In-content route error boundary (app-shell §6) — the shell chrome persists; the user
// can retry without a full reload.
export default function AdminRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState onRetry={reset} />;
}
