import type { Metadata } from "next";
import { ServicesPageContent } from "@/src/components/services-page-content";
import { pageMetadata } from "@/src/lib/pages/page-metadata";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public Services directory route (services-fe-public §A/§F). Server-rendered; metadata from the
// PAGES services-index SeoMeta (pages-fe-public §G), ISR per the shared convention. Service URLs
// are aggregated into the sitemap by Wave-A getPublicSitemap (respecting noindex).
export const revalidate = REVALIDATE;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("services-index", {
    title: "Services",
    summary: "Our full-spectrum construction service portfolio — infrastructure, structural systems, utilities and project management.",
    path: "/services",
  });
}

export default function ServicesPage() {
  return <ServicesPageContent />;
}
