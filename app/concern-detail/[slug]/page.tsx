import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConcernDetailPageContent } from "@/src/components/concern-detail-page-content";
import { getPublishedConcernBySlug } from "@/lib/data/concerns";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { JsonLd, BreadcrumbJsonLd } from "@/src/components/seo/json-ld";
import { isImageRef } from "@/src/lib/media/ref";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public Concern profile route (concerns-fe-public §A/§B/§E). Server-rendered from
// getPublishedConcernBySlug; generateMetadata + Organization/BreadcrumbList JSON-LD.
// Draft/archived/deleted + legacy_id slugs → 404 (legacy_id 301s via the Wave-A proxy).
export const revalidate = REVALIDATE;

type Params = { slug: string };
const imgUrl = (m: unknown) => (isImageRef(m as never) ? (m as { url: string }).url : null);

export async function generateMetadata({ params }: { params: Promise<Params> | Params }): Promise<Metadata> {
  const { slug } = await params;
  const concern = await getPublishedConcernBySlug(slug);
  if (!concern) return {};
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    record: { title: concern.name, summary: concern.tagline ?? concern.intro },
    defaults,
    ogImageUrl: imgUrl(concern.hero_image),
    path: `/concern-detail/${concern.slug}`,
  });
}

export default async function ConcernDetailBySlugPage({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const [concern, defaults] = await Promise.all([getPublishedConcernBySlug(slug), getPublicSeoDefaults()]);
  if (!concern) notFound();

  const base = defaults.metadata_base.replace(/\/$/, "");
  const orgJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: concern.name,
    ...(concern.tagline ? { slogan: concern.tagline } : {}),
    ...(concern.intro ? { description: concern.intro } : {}),
    url: `${base}/concern-detail/${concern.slug}`,
    ...(imgUrl(concern.hero_image) ? { image: imgUrl(concern.hero_image) } : {}),
    ...(concern.established_year ? { foundingDate: String(concern.established_year) } : {}),
    parentOrganization: { "@type": "Organization", name: "Zakir Enterprise" },
  };

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${base}/` },
          { name: "Concerns", url: `${base}/concern-detail` },
          { name: concern.name, url: `${base}/concern-detail/${concern.slug}` },
        ]}
      />
      <ConcernDetailPageContent concern={concern} />
    </>
  );
}
