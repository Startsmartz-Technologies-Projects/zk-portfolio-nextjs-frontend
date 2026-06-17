import type { Metadata } from "next";
import { CertificationsPageContent } from "@/src/components/certifications-page-content";
import { pageMetadata } from "@/src/lib/pages/page-metadata";
// Public Certifications directory route (certifications-fe-public §A/§F). Server-rendered; ISR per
// the shared convention. No per-record SeoMeta (no detail URLs, BR-8) — page metadata now comes
// from the PAGES certifications-index SeoMeta (pages-fe-public §G).
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("certifications-index", {
    title: "Certifications & Credentials",
    summary: "Official registrations, approvals and certifications held by Zakir Enterprise — current, verified and available for pre-qualification.",
    path: "/certifications",
  });
}

export default function CertificationsPage() {
  return <CertificationsPageContent />;
}
