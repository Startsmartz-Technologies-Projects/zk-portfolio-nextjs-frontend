import { Nav } from "@/src/components/nav";
import { Footer } from "@/src/components/footer";
import { ServiceDetailsPageContent } from "@/src/components/service-details-page-content";

export default async function ServiceDetailsBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams =
    typeof (params as Promise<{ slug: string }>)?.then === "function"
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });

  const serviceSlug = decodeURIComponent(resolvedParams.slug);

  return (
    <>
      <Nav />
      <ServiceDetailsPageContent serviceSlug={serviceSlug} />
      <Footer />
    </>
  );
}
