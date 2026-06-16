import type { Metadata } from "next";
import "./globals.css";
import "../src/styles/styles.css";
import "../src/styles/legacy_pages.css";
import "../src/styles/responsive.css";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { OrganizationJsonLd } from "@/src/components/seo/json-ld";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Global SEO defaults from the SEO settings singleton (web-fe-seo-layer / FR-SEO-002/018):
// metadataBase, the `%s` title template + default title/description, default OG image,
// twitter handle, default robots, and search-console verification tokens. Module routes
// layer their own metadata via `buildMetadata` (returns an absolute title, so this
// template is not applied twice).
export async function generateMetadata(): Promise<Metadata> {
  const d = await getPublicSeoDefaults();
  const brand = d.site_title_template.replace("%s", "").replace(/^[\s·|–—-]+|[\s·|–—-]+$/g, "").trim() || "Zakir Enterprise";

  return {
    ...(d.metadata_base ? { metadataBase: new URL(d.metadata_base) } : {}),
    title: { default: brand, template: d.site_title_template },
    description: d.default_meta_description || undefined,
    // Favicon brand asset is wired from the SITE bundle in web-fe-site-chrome.
    icons: {
      icon: "https://res.cloudinary.com/dk4csiouq/image/upload/v1777180913/Heading_24_t5zzbn.png",
    },
    openGraph: {
      siteName: brand,
      ...(d.default_og_image?.url ? { images: [{ url: d.default_og_image.url }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(d.twitter_handle ? { site: d.twitter_handle } : {}),
    },
    ...(d.default_robots === "noindex_nofollow" ? { robots: { index: false, follow: false } } : {}),
    verification: {
      ...(d.google_site_verification ? { google: d.google_site_verification } : {}),
      ...(d.bing_site_verification ? { other: { "msvalidate.01": d.bing_site_verification } } : {}),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await getPublicSeoDefaults();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <OrganizationJsonLd organization={organization} />
      </head>
      <body>{children}</body>
    </html>
  );
}
