import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AuthCard } from "@/src/components/admin/auth/auth-card";
import { LoginForm } from "@/src/components/admin/auth/login-form";
import { sanitizeNext } from "@/src/components/admin/auth/next-path";

export const metadata: Metadata = {
  title: "Sign in · Zakir Enterprise Admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = sanitizeNext(next);

  // An already-authenticated visitor shouldn't see the login form.
  const principal = await auth();
  if (principal) {
    redirect(principal.must_change_password ? "/admin/change-password" : target);
  }

  return (
    <AuthCard
      title="Sign in to Zakir Enterprise Admin"
      subtitle="Manage content, media, and site settings."
      footer="Need access? Ask an administrator to create your account."
    >
      <LoginForm next={target} />
    </AuthCard>
  );
}
