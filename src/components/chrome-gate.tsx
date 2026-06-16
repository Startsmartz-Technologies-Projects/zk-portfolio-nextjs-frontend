"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public marketing chrome (Nav / Footer) on `/admin/*` routes.
 *
 * The app has a single root layout (app/layout.tsx) that renders the public Nav +
 * Footer around every route. The admin panel is a separate surface (ADR 0002) and
 * must not inherit them. `usePathname()` resolves per-route at render — on a public
 * route it returns null (rendering the children), on an admin route it returns the
 * children as null — without opting the root layout into dynamic rendering (so the
 * public site's ISR is untouched, unlike a `headers()`-based check).
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
