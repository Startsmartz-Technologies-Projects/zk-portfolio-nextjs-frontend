"use client";

import * as React from "react";
import { KeyRound, Loader2, LogOut, MoreHorizontal, Plus, RotateCcw, Search, Trash2, UserPlus } from "lucide-react";

import {
  listUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  restoreUserAction,
  resetPasswordAction,
  revokeSessionsAction,
} from "@/app/admin/users/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Field } from "@/src/components/admin/shared/form-fields";
import { Pagination } from "@/src/components/admin/shared/list-primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useToast } from "@/src/components/ui/use-toast";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { formatDate } from "@/src/lib/format-date";

type Role = "admin" | "editor";
type Status = "active" | "suspended";

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: Status;
  mustChangePassword: boolean;
  lastLoginAt: string | Date | null;
  createdAt: string | Date;
  deletedAt: string | Date | null;
}

const PAGE_SIZE = 20;

export interface UsersAdminProps {
  principalId: string;
}

export function UsersAdmin({ principalId }: UsersAdminProps) {
  const { toast } = useToast();
  const confirm = useConfirm();

  const [rows, setRows] = React.useState<UserRow[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState<"" | Role>("");
  const [status, setStatus] = React.useState<"" | Status>("");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  const [dialog, setDialog] = React.useState<{ mode: "add" } | { mode: "edit"; user: UserRow } | null>(null);
  const [tempPassword, setTempPassword] = React.useState<{ email: string; password: string } | null>(null);

  const seq = React.useRef(0);
  const load = React.useCallback(async () => {
    const s = ++seq.current;
    setRows(null);
    setLoadError(false);
    try {
      const res = await listUsersAction({
        q: q.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        includeDeleted: includeDeleted || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      if (s !== seq.current) return;
      setRows(res.data as UserRow[]);
      setTotal(res.meta.total);
    } catch {
      if (s !== seq.current) return;
      setLoadError(true);
    }
  }, [q, role, status, includeDeleted, page]);

  React.useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0); // debounce search
    return () => clearTimeout(t);
  }, [load, q]);

  async function onDelete(u: UserRow) {
    const ok = await confirm({
      title: `Deactivate '${u.fullName}'?`,
      description: "They can't sign in until restored. Their authored records keep their name.",
      confirmLabel: "Deactivate",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteUserAction(u.id);
      toast({ variant: "success", title: "User deactivated." });
      load();
    } catch {
      toast({ variant: "destructive", title: "Couldn't deactivate — this may be the last admin." });
    }
  }

  async function onRestore(u: UserRow) {
    try {
      await restoreUserAction(u.id);
      toast({ variant: "success", title: "User restored." });
      load();
    } catch {
      toast({ variant: "destructive", title: "Couldn't restore the user." });
    }
  }

  async function onResetPassword(u: UserRow) {
    const ok = await confirm({
      title: `Reset password for '${u.fullName}'?`,
      description: "A temporary password is generated and shown once; their sessions are signed out.",
      confirmLabel: "Reset password",
    });
    if (!ok) return;
    try {
      const { tempPassword: pw } = await resetPasswordAction(u.id);
      setTempPassword({ email: u.email, password: pw });
      toast({ variant: "success", title: "Password reset." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't reset the password." });
    }
  }

  async function onRevokeSessions(u: UserRow) {
    try {
      const { revoked } = await revokeSessionsAction(u.id);
      toast({ variant: "success", title: `Signed out ${revoked} session(s).` });
    } catch {
      toast({ variant: "destructive", title: "Couldn't revoke sessions." });
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        breadcrumbs={[{ label: "Users" }]}
        actions={
          <Button onClick={() => setDialog({ mode: "add" })} className="gap-1.5">
            <UserPlus className="h-4 w-4" /> Add user
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            placeholder="Search name or email…"
            className="w-64 pl-8"
            aria-label="Search users"
          />
        </div>
        <select value={role} onChange={(e) => { setPage(1); setRole(e.target.value as "" | Role); }} aria-label="Filter by role" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as "" | Status); }} aria-label="Filter by status" className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <label className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <input type="checkbox" checked={includeDeleted} onChange={(e) => { setPage(1); setIncludeDeleted(e.target.checked); }} className="h-4 w-4 rounded border-input" />
          Show deactivated
        </label>
      </div>

      {/* Table */}
      <div className="relative w-full overflow-auto rounded-[10px] border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border [&_th]:h-11 [&_th]:bg-secondary/40 [&_th]:px-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
              <th>Name</th>
              {/* Email absorbs spare width so the row fills the table (no right-side gap). */}
              <th className="w-full">Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last login</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : loadError ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center"><Button size="sm" variant="outline" onClick={load}>Retry</Button></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No users match your filters.</td></tr>
            ) : (
              rows.map((u) => {
                const isSelf = u.id === principalId;
                const deleted = Boolean(u.deletedAt);
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle">
                    <td>
                      <span className="font-medium text-foreground">{u.fullName}</span>
                      {isSelf && <span className="ml-1.5 text-[11px] text-muted-foreground">(you)</span>}
                      {deleted && <Badge variant="outline" className="ml-1.5">Deactivated</Badge>}
                    </td>
                    <td className="text-muted-foreground">{u.email}</td>
                    <td><Badge variant={u.role === "admin" ? "primary" : "outline"}>{u.role}</Badge></td>
                    <td>{u.status === "active" ? <Badge variant="published">Active</Badge> : <Badge variant="warning">Suspended</Badge>}</td>
                    <td className="whitespace-nowrap text-muted-foreground">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}</td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={`Actions for ${u.fullName}`}><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {deleted ? (
                            <DropdownMenuItem onSelect={() => onRestore(u)}><RotateCcw className="h-4 w-4" /> Restore</DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onSelect={() => setDialog({ mode: "edit", user: u })}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onResetPassword(u)}><KeyRound className="h-4 w-4" /> Reset password</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onRevokeSessions(u)}><LogOut className="h-4 w-4" /> Sign out sessions</DropdownMenuItem>
                              <DropdownMenuItem disabled={isSelf} onSelect={() => !isSelf && onDelete(u)} className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />}

      {dialog && (
        <UserDialog
          key={dialog.mode === "edit" ? dialog.user.id : "add"}
          dialog={dialog}
          isSelf={dialog.mode === "edit" && dialog.user.id === principalId}
          onClose={() => setDialog(null)}
          onCreated={(email, password) => { setDialog(null); setTempPassword({ email, password }); load(); }}
          onSaved={() => { setDialog(null); load(); }}
        />
      )}

      {tempPassword && <TempPasswordDialog data={tempPassword} onClose={() => setTempPassword(null)} />}
    </div>
  );
}

function UserDialog({
  dialog,
  isSelf,
  onClose,
  onCreated,
  onSaved,
}: {
  dialog: { mode: "add" } | { mode: "edit"; user: UserRow };
  isSelf: boolean;
  onClose: () => void;
  onCreated: (email: string, password: string) => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const editing = dialog.mode === "edit" ? dialog.user : null;
  const [fullName, setFullName] = React.useState(editing?.fullName ?? "");
  const [email, setEmail] = React.useState(editing?.email ?? "");
  const [role, setRole] = React.useState<Role>(editing?.role ?? "editor");
  const [status, setStatus] = React.useState<Status>(editing?.status ?? "active");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!fullName.trim()) return setError("Enter a full name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    try {
      if (dialog.mode === "add") {
        const res = await createUserAction({ fullName: fullName.trim(), email: email.trim(), role });
        onCreated(res.user.email, res.tempPassword);
      } else {
        await updateUserAction(dialog.user.id, { fullName: fullName.trim(), email: email.trim(), role, status });
        toast({ variant: "success", title: "User updated." });
        onSaved();
      }
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      setError(/email|exist|taken|conflict/i.test(msg) ? "That email is already in use." : "Couldn't save — check the details or admin/self guards.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialog.mode === "add" ? "Add user" : "Edit user"}</DialogTitle>
          <DialogDescription>
            {dialog.mode === "add"
              ? "Creates an account with a temporary password (shown once)."
              : "Update the user's profile, role, and status."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Field label="Full name" htmlFor="u-name" error={error && !fullName.trim() ? error : undefined}>
            <Input id="u-name" value={fullName} autoFocus onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="u-email" error={error && fullName.trim() ? error : undefined}>
            <Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role" htmlFor="u-role" helper={isSelf ? "You can't change your own role." : undefined}>
              <select id="u-role" value={role} disabled={isSelf} onChange={(e) => setRole(e.target.value as Role)} className="h-9 rounded-md border border-input bg-card px-3 text-sm disabled:opacity-60">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            {dialog.mode === "edit" && (
              <Field label="Status" htmlFor="u-status" helper={isSelf ? "You can't suspend yourself." : undefined}>
                <select id="u-status" value={status} disabled={isSelf} onChange={(e) => setStatus(e.target.value as Status)} className="h-9 rounded-md border border-input bg-card px-3 text-sm disabled:opacity-60">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {dialog.mode === "add" ? (busy ? "Creating…" : "Create") : busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TempPasswordDialog({ data, onClose }: { data: { email: string; password: string }; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Temporary password</DialogTitle>
          <DialogDescription>
            Share this with <strong>{data.email}</strong> securely. It is shown <strong>once</strong> — they must change it on first sign-in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-3">
          <code className="flex-1 select-all break-all font-mono text-sm">{data.password}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(data.password);
              toast({ variant: "success", title: "Copied." });
            }}
          >
            Copy
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
