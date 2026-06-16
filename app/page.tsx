import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer, type PageSection, type SectionRecords } from "@/src/components/pages/section-renderer";
import { getPublishedPage } from "@/lib/data/pages";
import { getFeaturedProjects } from "@/lib/data/projects";
import { getPublishedServices } from "@/lib/data/services";
import { getHomeSeals } from "@/lib/data/certifications";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { isImageRef } from "@/src/lib/media/ref";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Home route (pages-fe-public §A/§B/§C/§G). Server-rendered from getPublishedPage('home') via the
// section renderer; collection-backed strips (source_key) get their records from each collection's
// lib/data. generateMetadata from the page SeoMeta; ISR per the shared convention.
export const revalidate = REVALIDATE;

const imgUrl = (m: unknown) => (isImageRef(m as never) ? (m as { url: string }).url : null);

export async function generateMetadata(): Promise<Metadata> {
  const [page, defaults] = await Promise.all([getPublishedPage("home"), getPublicSeoDefaults()]);
  return buildMetadata({
    seo: page
      ? {
          metaTitle: page.seo.meta_title,
          metaDescription: page.seo.meta_description,
          canonicalUrl: page.seo.canonical_url,
          ogTitle: page.seo.og_title,
          ogDescription: page.seo.og_description,
          noindex: page.seo.noindex,
        }
      : null,
    record: { title: "Zakir Enterprise" },
    defaults,
    ogImageUrl: imgUrl(page?.seo.og_image),
    path: "/",
  });
}

export default async function Page() {
  const page = await getPublishedPage("home");
  if (!page) notFound();

  // Resolve collection records only for the source_keys this page actually uses.
  const sourceKeys = new Set(page.sections.map((s) => (s as PageSection).source_key).filter(Boolean));
  const [featured, services, seals] = await Promise.all([
    sourceKeys.has("projects.featured") ? getFeaturedProjects() : Promise.resolve({ data: [] }),
    sourceKeys.has("services.featured") ? getPublishedServices() : Promise.resolve({ data: [] }),
    sourceKeys.has("certifications.home-seals") ? getHomeSeals() : Promise.resolve({ data: [] }),
  ]);
  const records: SectionRecords = {
    projects: featured.data,
    services: services.data,
    certifications: seals.data,
  };

  return <SectionRenderer sections={page.sections as PageSection[]} records={records} />;
}
