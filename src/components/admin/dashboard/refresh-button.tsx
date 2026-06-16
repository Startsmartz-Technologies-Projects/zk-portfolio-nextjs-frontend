"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";

// Manual refresh for the dashboard (FR-DASH — the summary caches ~30s server-side;
// router.refresh re-runs the server component to pull a fresh aggregate).
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="gap-1.5"
    >
      <RotateCw className={pending ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
    </Button>
  );
}
