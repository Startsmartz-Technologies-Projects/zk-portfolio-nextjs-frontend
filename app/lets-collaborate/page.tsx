import type { Metadata } from "next";
import { LetsCollaboratePageContent, type CollaborateChrome } from "@/src/components/lets-collaborate-page-content";
import { getPublishedPage } from "@/lib/data/pages";
import { getSiteChrome } from "@/src/lib/site/chrome";
import { getOptionSets } from "@/lib/leads/options";
import { pageMetadata } from "@/src/lib/pages/page-metadata";

// Lets-Collaborate route (pages-fe-public §A/§E/§G). The page chrome — hero, trust-hook chips,
// intent-card labels, contact lines — is server-fetched from getPublishedPage('lets-collaborate')
// + the SITE chrome bundle and threaded into the (client) page, which keeps the working inquiry
// form. The form's data wiring is the separate leads-fe-public-form task (Wave D); this brief owns
// only the chrome + intent labels.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("lets-collaborate", {
    title: "Let's Collaborate",
    summary: "Start a construction project with Zakir Enterprise — collaborate, quote and execute across all 64 districts of Bangladesh.",
    path: "/lets-collaborate",
  });
}

export default async function LetsCollaboratePage() {
  const [page, site] = await Promise.all([getPublishedPage("lets-collaborate"), getSiteChrome()]);
  const sections = page?.sections ?? [];
  const hero = sections.find((s) => s.type === "hero");
  const trustHook = sections.find((s) => s.type === "trust_hook");
  const intentCards = sections.find((s) => s.type === "intent_cards");

  // Section items are a union (resolved-stat vs full-item); these sections carry full items.
  type Item = { icon?: string | null; title?: string | null; body?: string | null };
  const itemsOf = (s: (typeof sections)[number] | undefined): Item[] =>
    s && "items" in s && Array.isArray(s.items) ? (s.items.filter(Boolean) as Item[]) : [];

  const chrome: CollaborateChrome = {
    heroEyebrow: hero?.eyebrow ?? null,
    heroHeading: hero?.heading ?? null,
    heroSub: hero?.subheading ?? null,
    trustHeading: trustHook?.heading ?? null,
    trustChips: itemsOf(trustHook).map((i) => i.title ?? "").filter(Boolean),
    intentEyebrow: intentCards?.eyebrow ?? null,
    intentHeading: intentCards?.heading ?? null,
    intentSub: intentCards?.subheading ?? null,
    intentItems: itemsOf(intentCards).map((i) => ({ icon: i.icon ?? "", title: i.title ?? "", description: i.body ?? "" })),
    contact: { phone: site.phone, email: site.email, officeAddress: site.officeAddress },
  };

  // Controlled form option sets (leads-fe-public-form §A2) — code constants, resolved server-side
  // so the form renders them without a client round-trip (the /api/inquiries/options route serves
  // the same payload for completeness).
  const options = getOptionSets();

  return <LetsCollaboratePageContent chrome={chrome} options={options} />;
}
