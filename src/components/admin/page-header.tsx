import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/src/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * The content-area header every inner admin screen renders (app-shell §3):
 * breadcrumb › page title › actions. Module screens pass their own crumbs/title/actions.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  const crumbs: Crumb[] = breadcrumbs ?? [
    { label: "Dashboard", href: "/admin/dashboard" },
  ];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                {crumb.href && !last ? (
                  <Link
                    href={crumb.href}
                    className="rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn(last && "text-foreground")} aria-current={last ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
                {!last && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold leading-tight">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
