import "server-only";

import { getPublicSeoDefaults } from "@/lib/data/seo";
import type { SeoDefaults } from "@/lib/seo/seo-meta";

/**
 * Adapt the public SEO defaults bundle (snake_case) to the SeoDefaults shape the
 * seo-sidebar's resolver expects, plus the metadataBase for preview URLs. Shared by
 * every admin editor page that mounts the SEO sidebar (projects, services, blog, …).
 */
export async function loadSeoDefaults(): Promise<{ defaults: SeoDefaults; metadataBase: string }> {
  const d = await getPublicSeoDefaults();
  return {
    metadataBase: d.metadata_base || "",
    defaults: {
      siteTitleTemplate: d.site_title_template || "%s",
      defaultMetaDescription: d.default_meta_description || "",
      defaultOgImageId: d.default_og_image?.id ?? null,
      defaultRobots: d.default_robots,
    },
  };
}
