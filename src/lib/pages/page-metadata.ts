import type { Metadata } from "next";
import { getPublishedPage } from "@/lib/data/pages";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { isImageRef } from "@/src/lib/media/ref";

// Build a route's Metadata from a PAGES page's embedded SeoMeta (pages-fe-public §G). Used by the
// singleton + collection-index routes so their title/description/OG/canonical/robots come from the
// page record. Falls back to the provided record title when the page isn't published.

const imgUrl = (m: unknown) => (isImageRef(m as never) ? (m as { url: string }).url : null);

export async function pageMetadata(publicKey: string, fallback: { title: string; summary?: string | null; path: string }): Promise<Metadata> {
  const [page, defaults] = await Promise.all([getPublishedPage(publicKey), getPublicSeoDefaults()]);
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
    record: { title: fallback.title, summary: fallback.summary },
    defaults,
    ogImageUrl: imgUrl(page?.seo.og_image),
    path: page?.path ?? fallback.path,
  });
}
