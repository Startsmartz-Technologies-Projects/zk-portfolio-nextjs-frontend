"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, KeyRound, LogOut, MonitorSmartphone, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useToast } from "@/src/components/ui/use-toast";

export interface AccountPrincipal {
  full_name: string;
  email: string;
  role: "admin" | "editor";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_LABEL: Record<AccountPrincipal["role"], string> = {
  admin: "Administrator",
  editor: "Editor",
};

/**
 * Top-bar account menu (app-shell §5) — shows the `auth()` principal (FR-AUTH-006) and
 * links to profile/change-password, active sessions, and a server-confirmed logout
 * (FR-AUTH-003). The screens it links to are built by `auth-admin-ui`.
 */
export function AccountMenu({ principal }: { principal: AccountPrincipal }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  async function logout() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      // Full navigation so all client state + the cleared cookie take effect.
      window.location.assign("/admin/login");
    } catch {
      setBusy(false);
      toast({
        variant: "destructive",
        title: "Couldn't sign out",
        description: "Please try again.",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Account menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(principal.full_name)}
        </span>
        <span className="hidden max-w-[10rem] truncate text-left sm:block" title={principal.full_name}>
          {principal.full_name}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate" title={principal.full_name}>
            {principal.full_name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground" title={principal.email}>
            {principal.email}
          </span>
          <span className="mt-1 text-xs font-normal text-muted-foreground">
            {ROLE_LABEL[principal.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/account">
            <User /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/account/change-password">
            <KeyRound /> Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/account/sessions">
            <MonitorSmartphone /> Active sessions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void logout();
          }}
          disabled={busy}
        >
          <LogOut /> {busy ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
