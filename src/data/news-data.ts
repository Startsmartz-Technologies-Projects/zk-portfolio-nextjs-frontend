// News Corner data — extracted from news-page-content.tsx so it can be consumed as
// plain data (the public component + the backend seed import) without pulling in the
// client component. Shapes preserved verbatim from the legacy source.

export type NewsBodyBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; stats: Array<{ big: string; lbl: string }> }
  | { type: "image"; src: string; cap?: string };

export interface NewsBody {
  lead: string;
  sections: NewsBodyBlock[];
  tags: string[];
}

export interface NewsItem {
  id: string;
  category: string;
  date: string;
  dateISO: string;
  title: string;
  excerpt: string;
  image: string;
  featured?: boolean;
  readTime: string;
}

export const NEWS_DATA: NewsItem[] = [
  {
    id: "road-dhaka-awarded",
    category: "Awarded Project",
    date: "March 18, 2026",
    dateISO: "2026-03-18",
    title: "Zakir Enterprise Awarded Major Road Development Project in Dhaka",
    excerpt: "A BDT 180 crore contract for a 42-kilometer four-lane corridor under the Roads & Highways Department strengthens our national infrastructure portfolio.",
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1600&q=80&auto=format&fit=crop",
    featured: true,
    readTime: "5 min read",
  },
  {
    id: "iso-9001-renewed",
    category: "Achievement",
    date: "March 02, 2026",
    dateISO: "2026-03-02",
    title: "ISO 9001:2015 Certification Successfully Renewed for Third Consecutive Cycle",
    excerpt: "Zakir Enterprise clears its annual quality management audit with zero non-conformities, underscoring a decade of process discipline.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "padma-bridge-milestone",
    category: "Milestone",
    date: "February 25, 2026",
    dateISO: "2026-02-25",
    title: "Padma South Connector Project Reaches 70% Structural Completion",
    excerpt: "Our civil works package on the Padma South corridor crosses a significant delivery milestone with superstructure erection complete.",
    image: "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
  {
    id: "lged-tender-submission",
    category: "Tender Notice",
    date: "February 12, 2026",
    dateISO: "2026-02-12",
    title: "Pre-Qualified for Three LGED Rural Infrastructure Tenders in Sylhet Division",
    excerpt: "Selection advances us to the technical evaluation round for combined works worth approximately BDT 310 crore.",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "csr-floods-rangpur",
    category: "CSR Activity",
    date: "January 30, 2026",
    dateISO: "2026-01-30",
    title: "Emergency Relief & Rebuild Program Launched Across Rangpur Flood-Affected Villages",
    excerpt: "Deploying machinery and workforce to restore access roads and culverts in twelve communities affected by the winter floods.",
    image: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
  {
    id: "excellence-award-2025",
    category: "Achievement",
    date: "January 14, 2026",
    dateISO: "2026-01-14",
    title: "Bangladesh Construction Excellence Award 2025 - Infrastructure Category Winner",
    excerpt: "Recognised for outstanding delivery on the Chattogram Industrial Access Road by the Association of Builders of Bangladesh.",
    image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1600&q=80&auto=format&fit=crop",
    featured: false,
    readTime: "3 min read",
  },
  {
    id: "new-batching-plant",
    category: "Announcement",
    date: "December 20, 2025",
    dateISO: "2025-12-20",
    title: "New High-Capacity Concrete Batching Plant Commissioned in Narayanganj",
    excerpt: "A 120 m3/hour facility expanding in-house concrete supply capability for the southern project corridor.",
    image: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "rhd-partnership-framework",
    category: "Announcement",
    date: "December 08, 2025",
    dateISO: "2025-12-08",
    title: "Framework Agreement Signed with Roads & Highways Department for 2026 Projects",
    excerpt: "A multi-project delivery framework positioning Zakir Enterprise for major highway and bridge works next year.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
  {
    id: "bauma-expo",
    category: "Event Participation",
    date: "November 22, 2025",
    dateISO: "2025-11-22",
    title: "Zakir Enterprise at BAUMA South Asia 2025 - Machinery & Methods Showcase",
    excerpt: "Our engineering team presented Bangladesh case studies and explored next-generation earthmoving equipment.",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600&q=80&auto=format&fit=crop",
    readTime: "2 min read",
  },
  {
    id: "safety-milestone",
    category: "Milestone",
    date: "November 05, 2025",
    dateISO: "2025-11-05",
    title: "One Million Man-Hours Worked Without Lost-Time Injury Across Six Active Sites",
    excerpt: "A record safety milestone celebrated with workforce recognition and renewed HSE training commitments.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "osha-training",
    category: "Achievement",
    date: "October 18, 2025",
    dateISO: "2025-10-18",
    title: "120 Site Supervisors Complete Advanced OSHA-Aligned Safety Training",
    excerpt: "A structured safety leadership program rolled out across all regional project offices this quarter.",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=80&auto=format&fit=crop",
    readTime: "3 min read",
  },
  {
    id: "cumilla-industrial-park",
    category: "Awarded Project",
    date: "October 02, 2025",
    dateISO: "2025-10-02",
    title: "Cumilla Industrial Park Site Development Contract Awarded",
    excerpt: "A BDT 95 crore earthwork, drainage and utility package for a new industrial zone under BEZA.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop",
    readTime: "4 min read",
  },
];

export const NEWS_CATEGORIES = [
  "Announcement",
  "Achievement",
  "Awarded Project",
  "Tender Notice",
  "CSR Activity",
  "Milestone",
  "Event Participation",
];

export function getNewsById(id: string) {
  return NEWS_DATA.find((n) => n.id === id);
}

const ARTICLE_BODIES: Record<string, NewsBody> = {
  "road-dhaka-awarded": {
    lead: "Zakir Enterprise has been awarded a BDT 180 crore civil works contract under the Roads & Highways Department to deliver a 42-kilometer four-lane corridor expansion across Dhaka's eastern bypass - a significant strengthening of our national infrastructure portfolio and a decisive vote of confidence from the country's leading road authority.",
    sections: [
      { type: "h2", text: "A strategic national corridor" },
      { type: "p", text: "The newly awarded scope covers full-width road widening, median construction, rigid pavement works, stormwater drainage upgrades, and the construction of fourteen new RCC box culverts. Work will be executed over a 24-month delivery window, with the first site mobilization scheduled for April 2026." },
      { type: "p", text: "This corridor is a critical link between Dhaka's eastern periphery and the greater industrial belt. Once operational, it is expected to reduce heavy-vehicle transit times into the capital by nearly 40% and unlock further private investment along the route." },
      {
        type: "callout",
        stats: [
          { big: "BDT 180Cr", lbl: "Contract Value" },
          { big: "42 km", lbl: "Corridor Length" },
          { big: "24 mo", lbl: "Delivery Window" },
        ],
      },
      { type: "h2", text: "Scope of civil works" },
      { type: "p", text: "The integrated scope positions Zakir Enterprise across every layer of the road delivery stack - from earthwork and sub-base through to premium finishing and ancillary structures." },
      {
        type: "ul",
        items: [
          "Full-depth pavement reconstruction across 42 km",
          "14 new RCC box culverts and drainage structures",
          "Premium asphalt surfacing with a 12-year design life",
          "Median construction, side drains, and safety barriers",
          "Road markings, signage, and reflective safety systems",
          "Environmental compliance and community coordination",
        ],
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1617972740399-d6fae21ebf3f?w=1600&q=80&auto=format&fit=crop",
        cap: "Road widening works will begin with intensive subgrade preparation across the first 12 km package.",
      },
      {
        type: "quote",
        text: "Winning this corridor is a proud moment for our team. It reflects a decade of disciplined delivery and the trust our national partners continue to place in Zakir Enterprise.",
        cite: "Managing Director - Zakir Enterprise",
      },
      { type: "h2", text: "Mobilization and delivery approach" },
      { type: "p", text: "Two full-scale project camps will be established - one in Narayanganj and one in Keraniganj - with dedicated batching plants, fabrication yards and a safety-audited workforce exceeding 400 personnel at peak. Weekly progress dashboards will be published to the client through our digital project office." },
      { type: "p", text: "Execution will follow our standard QA/QC protocol with independent laboratory testing for subgrade, base course and surfacing, alongside a quarterly environmental compliance audit. A milestone-linked payment framework provides full transparency to all stakeholders throughout the delivery cycle." },
    ],
    tags: ["Roads & Highways", "RHD", "Infrastructure", "Dhaka", "2026 Projects"],
  },
};

export function defaultBody(item: NewsItem): NewsBody {
  return {
    lead: item.excerpt,
    sections: [
      { type: "h2", text: "Overview" },
      { type: "p", text: "Zakir Enterprise continues to deliver on its commitment to bring disciplined civil execution, safety-audited sites, and on-time handover to every corner of Bangladesh's construction industry. This update reflects ongoing momentum across our active portfolio." },
      {
        type: "callout",
        stats: [
          { big: "100+", lbl: "Completed Projects" },
          { big: "64", lbl: "Districts Covered" },
          { big: "10 Yrs", lbl: "Proven Delivery" },
        ],
      },
      { type: "h2", text: "Why this matters" },
      { type: "p", text: "Each achievement, milestone, tender or CSR activity we publish in the Zakir Enterprise newsroom reflects real, measurable work - delivered by real teams at real sites. We publish openly because transparency is how the construction industry earns long-term trust." },
      {
        type: "ul",
        items: [
          "Full compliance documentation on every project",
          "Transparent, milestone-linked progress reporting",
          "Zero-compromise policy on worker safety and site HSE",
          "Deployable project teams across all 64 districts",
        ],
      },
      {
        type: "quote",
        text: "We measure our reputation in projects handed over on time, not in announcements. Every story here is backed by a site with real delivery.",
        cite: "Zakir Enterprise - Project Desk",
      },
      { type: "h2", text: "What's next" },
      { type: "p", text: "Our project desk continues to welcome new partnerships, tender collaborations and client briefs across all construction service lines. Visitors interested in a structured conversation are encouraged to reach out through our collaboration desk." },
    ],
    tags: ["Zakir Enterprise", "Bangladesh", "Construction"],
  };
}

/** The story body — the authored one where present, else a generated placeholder. */
export function getNewsBody(item: NewsItem): NewsBody {
  return ARTICLE_BODIES[item.id] ?? defaultBody(item);
}
