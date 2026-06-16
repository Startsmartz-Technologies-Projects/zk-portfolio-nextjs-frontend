import type { Metadata } from "next";
import { ServicesPageContent } from "@/src/components/services-page-content";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public Services directory route (services-fe-public §A/§F). Server-rendered; generateMetadata
// via the Wave-A helper, ISR per the shared convention. Service URLs are aggregated into the
// sitemap by Wave-A getPublicSitemap (respecting noindex).
export const revalidate = REVALIDATE;

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    record: { title: "Services", summary: "Our full-spectrum construction service portfolio — infrastructure, structural systems, utilities and project management." },
    defaults,
    path: "/services",
  });
}

export default function ServicesPage() {
  return <ServicesPageContent />;
}
