import "@/src/styles/admin-theme.css";
import { AdminProviders } from "@/src/components/admin/providers";

// The admin surface (ADR 0002). A nested layout under the single app root: it scopes the
// admin design tokens (`.admin-scope`, src/styles/admin-theme.css) and mounts the shell-wide
// providers (tooltips, confirm dialog, toaster). The public Nav/Footer rendered by the root
// layout are suppressed on `/admin/*` by <ChromeGate>, so this is a clean, isolated surface.
export default function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-scope">
      <AdminProviders>{children}</AdminProviders>
    </div>
  );
}
