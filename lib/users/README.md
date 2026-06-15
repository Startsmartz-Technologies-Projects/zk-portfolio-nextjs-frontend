# `lib/users` — authorization + audit (cross-cutting)

The shared enforcement surface every admin module composes (users-be-3, SRS
`users-roles` §5.3/§5.4). Two-fixed-role policy (`admin`/`editor`) — no dynamic
roles, permissions, or grant tables (BR-1).

| File | Responsibility |
|------|----------------|
| `capabilities.ts` | The fixed §8.2 capability matrix (`Capability` keys, `can()`). |
| `rbac.ts` | `requireCapability(cap)` — the role guard layered on AUTH's `auth()`. |
| `audit.ts` | `audit(input)` — the append-only, write-after-commit audit-write service. |
| `audit-read.ts` | `listAuditLog(filters)` + `streamAuditLogCsv(filters)` (admin reads). |

## Adoption pattern (for every `be-2` admin server action / route handler)

Each admin operation **declares its required capability** and **audits the result
after it commits**:

```ts
'use server'
import { requireCapability, audit } from '@/lib/users'

export async function publishProject(id: string) {
  // 1) Authorize — throws UnauthorizedError (401) / ForbiddenError (403 + access_denied audit).
  const principal = await requireCapability('content')

  // 2) Do the work (its own transaction). Stamp actors from the principal, never the client.
  const project = await db.project.update({
    where: { id },
    data: { status: 'published', publishedAt: new Date(), updatedById: principal.user_id },
  })

  // 3) Audit AFTER the mutation commits — best-effort, never fails the action,
  //    and a rolled-back action above means this line is never reached (no phantom entry).
  await audit({
    actorId: principal.user_id,
    action: 'publish',
    entityType: 'project',
    entityId: project.id,
    summary: `Published project '${project.title}'`,
    metadata: { changed: ['status'] },
  })

  return project
}
```

### Capability keys (§8.2)

`user_admin`, `site_settings`, `seo_config` — **admin only**. `seo_meta`, `content`,
`media`, `leads_triage`, `dashboard` — admin + editor. `leads_manage` (delete/export),
`audit_log` — **admin only**. Pick the key matching the area+action; the triage vs.
delete/export split is already encoded as separate keys.

### Translating the guard errors at the HTTP/action boundary

`requireCapability` throws `UnauthorizedError` (`statusCode 401`) or `ForbiddenError`
(`statusCode 403`). Route handlers map these to the platform error shape
`{ statusCode, error, message, details: [] }` (see `app/api/admin/audit/export/route.ts`).
Server actions may let them propagate to a shared boundary.

> **Append-only:** there is no update/delete path for audit entries (FR-USERS-017).
> Reads are admin-only via the `audit_log` capability.
