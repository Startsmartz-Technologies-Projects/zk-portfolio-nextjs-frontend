import type { Metadata } from "next";
import { BlogPageContent, type BlogIndexState } from "@/src/components/blog-page-content";
import { getPublicSeoDefaults } from "@/lib/data/seo";
import { buildMetadata } from "@/src/lib/seo/build-metadata";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public Blog index route (blog-fe-public §A/§F). Server-rendered; generateMetadata via the
// Wave-A helper, ISR per the shared convention. Article URLs are aggregated into the sitemap by
// Wave-A getPublicSitemap (respecting noindex).
export const revalidate = REVALIDATE;

export async function generateMetadata(): Promise<Metadata> {
  const defaults = await getPublicSeoDefaults();
  return buildMetadata({
    record: { title: "Insights & Articles", summary: "Construction knowledge, industry updates and project insights from Zakir Enterprise." },
    defaults,
    path: "/blogs",
  });
}

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function BlogsPage({ searchParams }: { searchParams: Promise<SearchParams> | SearchParams }) {
  const sp = await searchParams;
  const state: BlogIndexState = {
    q: one(sp.q),
    category: one(sp.category),
    sort: one(sp.sort),
    page: Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1),
  };
  return <BlogPageContent state={state} />;
}
