"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { visibleNavGroups, type NavItem } from "./nav-config";
import type { Role } from "@/lib/auth/jwt";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary/15 text-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <span className="relative flex items-center">
        {active && !collapsed && (
          <span className="absolute -left-3 h-5 w-0.5 rounded-full bg-primary" aria-hidden />
        )}
        <Icon className="h-[18px] w-[18px] shrink-0" />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

/**
 * Role-filtered primary navigation (foundations §3 / app-shell §3). Rendered both in the
 * desktop rail (with an icon-only `collapsed` mode) and inside the mobile drawer.
 */
export function SidebarNav({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: Role;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const groups = visibleNavGroups(role);

  return (
    <nav aria-label="Primary" className="flex flex-col gap-4 px-3 py-4">
      {groups.map((group, gi) => (
        <div key={group.label ?? `g-${gi}`} className="flex flex-col gap-1">
          {group.label && !collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
          {group.label && collapsed && gi > 0 && (
            <div className="mx-auto my-1 h-px w-6 bg-border" aria-hidden />
          )}
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}
