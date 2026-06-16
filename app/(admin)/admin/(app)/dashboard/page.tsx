import type { Metadata } from "next";
import Link from "next/link";

import { getDashboardAction } from "@/app/admin/dashboard/actions";
import { isUnavailable, type StatusCounts } from "@/lib/data/dashboard";
import { PageHeader } from "@/src/components/admin/page-header";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { RefreshButton } from "@/src/components/admin/dashboard/refresh-button";
import { formatDate } from "@/src/lib/format-date";

export const metadata: Metadata = { title: "Dashboard · Zakir Enterprise Admin" };

const CONTENT_MODULES = [
  { key: "projects", label: "Projects", href: "/admin/projects" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "blog", label: "Blog", href: "/admin/blog" },
  { key: "news", label: "News", href: "/admin/news" },
  { key: "certifications", label: "Certifications", href: "/admin/certifications" },
  { key: "concerns", label: "Concerns", href: "/admin/concerns" },
  { key: "pages", label: "Pages", href: "/admin/pages" },
] as const;

// Role-aware admin dashboard (dash-admin — Admin Wave 5). The summary is filtered
// server-side by role (editors never receive the users / redirects sections, FR-DASH-011);
// each section degrades to an `unavailable` marker independently (edge 2).
export default async function DashboardPage() {
  const summary = await getDashboardAction();
  const content = summary.content; // const binding keeps the isUnavailable narrowing inside the .map closure

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]} actions={<RefreshButton />} />

      {/* KPI strip */}
      {isUnavailable(summary.kpis) ? (
        <SectionUnavailable label="Key metrics" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Published projects" value={summary.kpis.published_projects} />
          <Kpi label="Districts covered" value={summary.kpis.districts_covered} />
          <Kpi label="Media assets" value={summary.kpis.media_assets} />
          <Kpi label="Years experience" value={summary.kpis.years_experience ?? "—"} />
        </div>
      )}

      {/* Content summary */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content</h2>
        {isUnavailable(content) ? (
          <SectionUnavailable label="Content" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CONTENT_MODULES.map((m) => (
              <ContentCard key={m.key} label={m.label} href={m.href} counts={content[m.key]} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-muted-foreground hover:text-foreground hover:underline">View inbox</Link>
          </div>
          <div className="rounded-[10px] border border-border bg-card p-5 shadow-sm">
            {isUnavailable(summary.leads) ? (
              <Unavailable />
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-semibold tabular-nums">{summary.leads.new}</span>
                  <span className="text-sm text-muted-foreground">new inquiries</span>
                </div>
                <ul className="mt-3 flex flex-col divide-y divide-border">
                  {summary.leads.recent.length === 0 ? (
                    <li className="py-2 text-sm text-muted-foreground">No new leads.</li>
                  ) : (
                    summary.leads.recent.map((l) => (
                      <li key={l.reference_no} className="flex items-center justify-between gap-2 py-2 text-sm">
                        <span className="min-w-0 truncate">
                          <span className="font-medium">{l.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{l.inquiry_type}</span>
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatDate(l.created_at)}</span>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Health + Users */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Health</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {isUnavailable(summary.health) ? (
              <Unavailable />
            ) : (
              <>
                <Kpi label="Drafts pending" value={summary.health.drafts_pending} muted />
                <Kpi label="Images missing alt" value={summary.health.images_missing_alt} muted />
                <Kpi label="Published, missing meta" value={summary.health.published_missing_meta} muted />
                {summary.health.redirects && <Kpi label="Legacy redirects" value={summary.health.redirects.legacy} muted />}
              </>
            )}
          </div>
          {summary.users !== undefined && !isUnavailable(summary.users) && (
            <div className="flex items-center justify-between rounded-[10px] border border-border bg-card p-4 text-sm shadow-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground tabular-nums">{summary.users.total}</strong> users · {summary.users.admins} admin(s)
              </span>
              <Button asChild variant="outline" size="sm"><Link href="/admin/users">Manage</Link></Button>
            </div>
          )}
        </section>
      </div>

      {/* Activity */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</h2>
        <div className="rounded-[10px] border border-border bg-card shadow-sm">
          {isUnavailable(summary.activity) ? (
            <div className="p-5"><Unavailable /></div>
          ) : summary.activity.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No recent activity yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {summary.activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.summary}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, muted }: { label: string; value: number | string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-[10px] border border-border bg-card p-5 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={muted ? "font-heading text-2xl font-semibold tabular-nums text-foreground" : "font-heading text-2xl font-semibold tabular-nums text-foreground"}>{value}</span>
    </div>
  );
}

function ContentCard({ label, href, counts }: { label: string; href: string; counts: StatusCounts | undefined }) {
  const c = counts ?? { draft: 0, published: 0, archived: 0 };
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/40">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="published">{c.published} published</Badge>
        <Badge variant="draft">{c.draft} draft</Badge>
        {c.archived > 0 && <Badge variant="archived">{c.archived} archived</Badge>}
      </div>
    </Link>
  );
}

function SectionUnavailable({ label }: { label: string }) {
  return (
    <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
      {label} metrics are temporarily unavailable.
    </div>
  );
}

function Unavailable() {
  return <p className="text-sm text-muted-foreground">Temporarily unavailable.</p>;
}
