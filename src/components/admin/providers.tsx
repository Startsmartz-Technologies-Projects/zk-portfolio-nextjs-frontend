"use client";

import { TooltipProvider } from "@/src/components/ui/tooltip";
import { Toaster } from "@/src/components/ui/toaster";
import { ConfirmDialogProvider } from "./confirm-dialog";

/**
 * Shell-wide client providers mounted once by the admin layout: tooltips, the global
 * confirm dialog, and the toast viewport. Wraps both the auth screens and the app shell
 * (everything under `.admin-scope`).
 */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ConfirmDialogProvider>
        {children}
        <Toaster />
      </ConfirmDialogProvider>
    </TooltipProvider>
  );
}
