import * as React from "react";

/**
 * Centered card frame for the standalone auth screens (login, forced change-password) —
 * rendered outside the app shell on the admin background (login spec §3 / §4).
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            Z
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
        {footer && (
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
