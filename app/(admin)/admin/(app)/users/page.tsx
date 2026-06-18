import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { UsersAdmin } from "@/src/components/admin/users/users-admin";

export const metadata: Metadata = { title: "Users · Zakir Enterprise Admin" };

// User administration — Admin-only (capability `user_admin`); the server actions
// re-enforce it and the last-admin / self-action policy guards (FR-USERS-010..013).
export default async function UsersPage() {
  const principal = await auth();
  if (!principal || !can(principal.role, "user_admin")) notFound();

  return <UsersAdmin principalId={principal.user_id} />;
}
