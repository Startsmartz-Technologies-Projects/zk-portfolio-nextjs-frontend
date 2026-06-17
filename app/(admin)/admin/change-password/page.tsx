import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AuthCard } from "@/src/components/admin/auth/auth-card";
import { ChangePasswordForm } from "@/src/components/admin/auth/change-password-form";
import { sanitizeNext } from "@/src/components/admin/auth/next-path";

export const metadata: Metadata = {
  title: "Set a new password · Zakir Enterprise Admin",
  robots: { index: false, follow: false },
};

// Forced change-password (FR-AUTH-012) — standalone, outside the shell, blocks all nav
// until success. The app-shell guard routes `must_change_password` users here. A user who
// is NOT forced is sent to the in-shell voluntary screen instead.
export default async function ForcedChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = sanitizeNext(next);

  const principal = await auth();
  if (!principal) redirect("/admin/login");
  if (!principal.must_change_password) redirect("/admin/account/change-password");

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a new password to finish signing in."
    >
      <ChangePasswordForm forced next={target} />
    </AuthCard>
  );
}
