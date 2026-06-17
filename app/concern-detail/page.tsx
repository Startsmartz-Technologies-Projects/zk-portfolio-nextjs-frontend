import { redirect, notFound } from "next/navigation";
import { getDefaultConcern } from "@/lib/data/concerns";

// /concern-detail (no slug) → redirect to the default concern's slug (concerns-fe-public §B,
// FR-CONC-027). The default is data-driven (getDefaultConcern), re-resolved on ISR so a changed
// default lands here without a code change.
export const revalidate = 60;

export default async function ConcernDetailPage() {
  const def = await getDefaultConcern();
  if (!def) notFound();
  redirect(`/concern-detail/${def.slug}`);
}
