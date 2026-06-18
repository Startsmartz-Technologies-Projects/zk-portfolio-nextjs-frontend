import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { can } from "@/lib/users/capabilities";
import { listTaxonomiesAction, listTermsAction } from "@/app/admin/taxonomies/actions";
import { TaxonomyManager, type VocabInitial } from "@/src/components/admin/site/taxonomy-manager";

export const metadata: Metadata = { title: "Taxonomies · Zakir Enterprise Admin" };

// Taxonomy manager — Admin-only CRUD over the SITE vocabularies (site-admin-taxonomy,
// Admin Wave 4). Route-guarded; the taxonomy actions re-enforce `site_settings`.
export default async function TaxonomyPage({ searchParams }: { searchParams: Promise<{ vocab?: string }> }) {
  const principal = await auth();
  if (!principal || !can(principal.role, "site_settings")) notFound();
  const { vocab } = await searchParams;

  const vocabRows = await listTaxonomiesAction();
  const vocabularies: VocabInitial[] = await Promise.all(
    vocabRows.map(async (v) => ({
      slug: v.slug,
      label: v.label,
      isShared: v.isShared,
      count: (await listTermsAction(v.slug, true)).length,
    })),
  );

  return (
    <TaxonomyManager
      vocabularies={vocabularies}
      initialVocab={vocab ?? vocabularies[0]?.slug ?? ""}
      canViewAuditLog={can(principal.role, "audit_log")}
    />
  );
}
