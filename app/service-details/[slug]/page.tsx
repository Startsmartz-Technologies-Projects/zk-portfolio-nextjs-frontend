import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailsPageContent } from "@/src/components/service-details-page-content";
import { getPublishedServiceBySlug } from "@/lib/data/services";
import { getSiteChrome } from "@/src/lib/site/chrome";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { ServiceJsonLd, FaqJsonLd, BreadcrumbJsonLd } from "@/src/components/seo/json-ld";
import { isImageRef } from "@/src/lib/media/ref";
// Public Service detail route (services-fe-public §A/§F). Server-rendered from
// getPublishedServiceBySlug; generateMetadata + Service/FAQPage/BreadcrumbList JSON-LD.
// Draft/archived/deleted slugs → 404 (BR-3). Legacy "Service Details.html" → Wave-A proxy redirect.
export const revalidate = 60;

type Params = { slug: string };
const imgUrl = (m: unknown) => (isImageRef(m as never) ? (m as { url: string }).url : null);

export async function generateMetadata({ params }: { params: Promise<Params> | Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) return {};
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    seo: {
      metaTitle: service.seo.meta_title,
      metaDescription: service.seo.meta_description,
      canonicalUrl: service.seo.canonical_url,
      ogTitle: service.seo.og_title,
      ogDescription: service.seo.og_description,
      noindex: service.seo.noindex,
    },
    record: { title: service.title, summary: service.subtitle },
    defaults,
    ogImageUrl: imgUrl(service.seo.og_image) ?? imgUrl(service.hero_image),
    path: `/service-details/${service.slug}`,
  });
}

export default async function ServiceDetailsBySlugPage({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const [service, chrome, defaults] = await Promise.all([getPublishedServiceBySlug(slug), getSiteChrome(), getPublicSeoDefaults()]);
  if (!service) notFound();

  const base = defaults.metadata_base.replace(/\/$/, "");
  const contact = { phone: chrome.phone, email: chrome.email, officeAddress: chrome.officeAddress };

  return (
    <>
      <ServiceJsonLd
        name={service.title}
        description={service.subtitle ?? service.overview_lead}
        url={`${base}/service-details/${service.slug}`}
        imageUrl={imgUrl(service.hero_image)}
        providerName={chrome.brandName}
      />
      {service.faq.length > 0 && <FaqJsonLd items={service.faq.map((f) => ({ question: f.question, answer: f.answer ?? "" }))} />}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${base}/` },
          { name: "Services", url: `${base}/services` },
          { name: service.title, url: `${base}/service-details/${service.slug}` },
        ]}
      />
      <ServiceDetailsPageContent service={service} contact={contact} />
    </>
  );
}
