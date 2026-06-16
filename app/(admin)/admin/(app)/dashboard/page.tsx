import type { Metadata } from "next";

import { PageHeader } from "@/src/components/admin/page-header";

export const metadata: Metadata = {
  title: "Dashboard · Zakir Enterprise Admin",
};

// Placeholder landing for Admin Wave 0 — confirms the shell, theme, and role-filtered nav
// render for an authenticated user. The live, role-aware dashboard (dash-be-1 reads) is
// built in Admin Wave 5.
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Use the sidebar to manage content, media, and site settings."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Content", "Media", "Inquiries"].map((label) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-[10px] border border-border bg-card p-5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <span className="font-heading text-2xl font-semibold text-muted-foreground tabular-nums">
              —
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        Live metrics and activity arrive with the Dashboard module (Admin Wave 5). The shell,
        navigation, and account controls above are fully functional.
      </div>
    </div>
  );
}
