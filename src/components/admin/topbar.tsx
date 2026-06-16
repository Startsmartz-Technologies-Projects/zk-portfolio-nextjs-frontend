"use client";

import Link from "next/link";
import { Menu, Plus, PanelLeftClose, PanelLeft, Search } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { AccountMenu, type AccountPrincipal } from "./account-menu";
import { visibleCreateItems } from "./nav-config";
import type { Role } from "@/lib/auth/jwt";

export function Topbar({
  role,
  principal,
  envBadge,
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
}: {
  role: Role;
  principal: AccountPrincipal;
  envBadge: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileNav: () => void;
}) {
  const createItems = visibleCreateItems(role);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
      {/* Mobile nav trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        onClick={onToggleCollapse}
      >
        {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>

      {/* Logo → Dashboard */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          Z
        </span>
        <span className="hidden font-heading text-sm font-semibold sm:block">
          Zakir Enterprise
          <span className="ml-1 font-normal text-muted-foreground">Admin</span>
        </span>
      </Link>

      {/* Global search — disabled placeholder in v1 (app-shell §5) */}
      <div className="ml-2 hidden flex-1 justify-center md:flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-full max-w-sm cursor-not-allowed items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Search content…</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Global search is coming soon</TooltipContent>
        </Tooltip>
      </div>

      <div className={cn("flex items-center gap-1.5", "md:ml-0 ml-auto")}>
        {/* + Create */}
        {createItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {createItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Env badge — STAGING when the SEO noindex switch is on (app-shell §5) */}
        {envBadge && (
          <Badge
            variant="warning"
            className="hidden sm:inline-flex"
            title="Site hidden from search engines"
          >
            STAGING
          </Badge>
        )}

        <AccountMenu principal={principal} />
      </div>
    </header>
  );
}
