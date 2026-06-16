import type { Metadata } from "next";
import { NewsPageContent, type NewsIndexState } from "@/src/components/news-page-content";
import { pageMetadata } from "@/src/lib/pages/page-metadata";
import { REVALIDATE } from "@/src/lib/site/taxonomy";

// Public News index route (news-fe-public §A/§F). Server-rendered; metadata from the PAGES
// news-index SeoMeta (pages-fe-public §G), ISR per the shared convention. Story URLs are
// aggregated into the sitemap by Wave-A getPublicSitemap (respecting noindex).
export const revalidate = REVALIDATE;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("news-index", {
    title: "News Corner",
    summary: "Latest updates, achievements, project milestones and company announcements from Zakir Enterprise.",
    path: "/news",
  });
}

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function NewsPage({ searchParams }: { searchParams: Promise<SearchParams> | SearchParams }) {
  const sp = await searchParams;
  const state: NewsIndexState = {
    q: one(sp.q),
    category: one(sp.category),
    sort: one(sp.sort),
    page: Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1),
  };
  return <NewsPageContent state={state} />;
}
