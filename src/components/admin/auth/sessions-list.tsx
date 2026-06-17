"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import {
  listSessionsAction,
  revokeSessionAction,
  signOutOtherSessionsAction,
} from "@/app/admin/account/actions";
import type { SessionListItem } from "@/lib/auth/session";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ErrorState } from "@/src/components/admin/shell-states";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useToast } from "@/src/components/ui/use-toast";

function deviceLabel(ua: string | null): string {
  if (!ua) return "Unknown device";
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iOS/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown OS";
  return `${browser} · ${os}`;
}

function formatDateTime(value: Date | null): string {
  if (!value) return "—";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionsList() {
  const confirm = useConfirm();
  const { toast } = useToast();
  const [sessions, setSessions] = React.useState<SessionListItem[] | null>(null);
  const [error, setError] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(false);
    setSessions(null);
    try {
      setSessions(await listSessionsAction());
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function revoke(item: SessionListItem) {
    const ok = await confirm({
      title: "Sign out this device?",
      description: `${deviceLabel(item.userAgent)} will be signed out immediately.`,
      confirmLabel: "Sign out",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(item.id);
    try {
      await revokeSessionAction(item.id);
      toast({ variant: "success", title: "Device signed out" });
      await load();
    } catch {
      toast({ variant: "destructive", title: "Couldn't sign out that device" });
    } finally {
      setBusyId(null);
    }
  }

  async function signOutEverywhere() {
    const ok = await confirm({
      title: "Log out everywhere else?",
      description: "All your other devices will be signed out. This device stays signed in.",
      confirmLabel: "Log out everywhere",
      destructive: true,
    });
    if (!ok) return;
    setBulkBusy(true);
    try {
      const { count } = await signOutOtherSessionsAction();
      toast({
        variant: "success",
        title:
          count === 0
            ? "No other devices were signed in"
            : `Signed out ${count} other device${count === 1 ? "" : "s"}`,
      });
      await load();
    } catch {
      toast({ variant: "destructive", title: "Couldn't sign out other devices" });
    } finally {
      setBulkBusy(false);
    }
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load your sessions"
        description="There was a problem fetching your active sessions."
        onRetry={load}
      />
    );
  }

  if (sessions === null) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {sessions.length} active session{sessions.length === 1 ? "" : "s"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={signOutEverywhere}
          disabled={bulkBusy || otherCount === 0}
        >
          {bulkBusy && <Loader2 className="h-4 w-4 animate-spin" />}
          Log out everywhere
        </Button>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead className="hidden sm:table-cell">IP</TableHead>
              <TableHead className="hidden md:table-cell">Signed in</TableHead>
              <TableHead className="hidden md:table-cell">Last active</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {deviceLabel(item.userAgent)}
                    {item.current && (
                      <Badge variant="primary" className="text-[11px]">
                        This device
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell tabular-nums">
                  {item.ip ?? "—"}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell tabular-nums">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell tabular-nums">
                  {formatDateTime(item.lastUsedAt)}
                </TableCell>
                <TableCell className="text-right">
                  {item.current ? (
                    <span className="text-[13px] text-muted-foreground">—</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => revoke(item)}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      Sign out
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
