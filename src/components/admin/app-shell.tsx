"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/src/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Topbar } from "./topbar";
import { SidebarNav } from "./sidebar";
import { RouteProgress } from "./route-progress";
import type { AccountPrincipal } from "./account-menu";

const COLLAPSE_KEY = "zk-admin-sidebar-collapsed";

/**
 * The persistent authenticated frame (app-shell spec). Owns sidebar collapse (persisted
 * per user in localStorage, §9) and the mobile drawer. Renders the top bar, the
 * role-filtered sidebar (desktop rail + mobile drawer), and the content `main` landmark.
 * Responsive per foundations §8: ≥1024 expanded rail · ≥768 icon rail · <1024 off-canvas drawer.
 */
export function AppShell({
  principal,
  envBadge,
  children,
}: {
  principal: AccountPrincipal;
  envBadge: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Restore the persisted collapse preference after mount (avoids a hydration mismatch).
  React.useEffect(() => {
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* localStorage unavailable — keep the default */
    }
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <RouteProgress />
      <a
        href="#admin-main"
        className="sr-only z-[300] rounded-md bg-card px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <Topbar
        role={principal.role}
        principal={principal}
        envBadge={envBadge}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onOpenMobileNav={() => setMobileOpen(true)}
      />

      <div className="flex flex-1">
        {/* Desktop rail — collapses to icons; hidden below lg (becomes the drawer). */}
        <aside
          className={cn(
            "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 overflow-y-auto border-r border-border bg-card transition-[width] duration-200 lg:block",
            collapsed ? "w-[68px]" : "w-60",
          )}
        >
          <SidebarNav role={principal.role} collapsed={collapsed} />
        </aside>

        <main id="admin-main" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile / tablet off-canvas drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                Z
              </span>
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                Zakir Enterprise{" "}
                <span className="font-normal text-muted-foreground">Admin</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            <SidebarNav role={principal.role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
