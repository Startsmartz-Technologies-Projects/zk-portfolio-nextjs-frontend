import { getPublishedPage } from "@/lib/data/pages";

// Resolve a collection index page's hero chrome from PAGES (pages-fe-public §D). Each Wave-B
// collection index page keeps its own listing/grid but takes its hero eyebrow/heading/subheading/
// CTAs from getPublishedPage('<collection>-index') instead of the hard-coded strings the Wave-B
// briefs left as a "→ PAGES" deferral. Returns null (caller keeps its static fallback) if the page
// or its hero section isn't published, so a missing page never blanks the hero.

export type IndexHero = {
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  cta_primary: { label: string; url: string } | null;
  cta_secondary: { label: string; url: string } | null;
  stats: Array<{ label: string | null; sublabel: string | null; value: string | null; unit: string | null }>;
};

export async function getIndexHero(publicKey: string): Promise<IndexHero | null> {
  const page = await getPublishedPage(publicKey);
  if (!page) return null;
  const hero = page.sections.find((s) => s.type === "hero");
  if (!hero) return null;
  // A stat_strip on the index page (e.g. projects) supplies the hero stat badges. Resolved stat
  // items carry label/sublabel/value/unit (the data layer maps them); filter any nulls.
  const statSection = page.sections.find((s) => s.type === "stat_strip");
  const rawStats = statSection && "items" in statSection && Array.isArray(statSection.items) ? statSection.items : [];
  const stats = rawStats
    .filter((i): i is NonNullable<typeof i> => i != null)
    .map((i) => {
      const it = i as { label?: string | null; sublabel?: string | null; title?: string | null; subtitle?: string | null; value?: string | null; unit?: string | null };
      return { label: it.label ?? it.title ?? null, sublabel: it.sublabel ?? it.subtitle ?? null, value: it.value ?? null, unit: it.unit ?? null };
    });
  return {
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    subheading: hero.subheading,
    cta_primary: hero.cta_primary,
    cta_secondary: hero.cta_secondary,
    stats,
  };
}
