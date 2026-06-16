import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { MediaLibrary } from "@/src/components/admin/media/media-library";

export const metadata: Metadata = { title: "Media · Zakir Enterprise Admin" };

// Media library (media-admin-library — Admin Wave 5). Both roles manage media
// (capability `media`); hard-delete / restore / withdrawn view are admin-only.
export default async function MediaPage() {
  const principal = await auth();
  if (!principal || !can(principal.role, "media")) notFound();

  return <MediaLibrary isAdmin={principal.role === "admin"} />;
}
