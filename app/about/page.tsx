import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer, type PageSection } from "@/src/components/pages/section-renderer";
import { getPublishedPage } from "@/lib/data/pages";
import { pageMetadata } from "@/src/lib/pages/page-metadata";

// About route (pages-fe-public §A/§G). Fully server-rendered from getPublishedPage('about') via the
// section renderer (story/mvv/timeline/leadership_message/why_us/achievements/clients_filterable +
// the shared hero/expertise_cards/final_cta). The clients sector filter is the one client island.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about", { title: "About Us", summary: "Zakir Enterprise — building Bangladesh with disciplined execution and dependable delivery since 2010.", path: "/about" });
}

export default async function AboutPage() {
  const page = await getPublishedPage("about");
  if (!page) notFound();
  return <SectionRenderer sections={page.sections as PageSection[]} />;
}
