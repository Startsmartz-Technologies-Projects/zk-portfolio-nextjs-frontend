import { Prisma } from '@prisma/client'
import type { PrismaClient, PageKey, SectionType } from '@prisma/client'
import { parseCloudinaryUrl } from './media.seed'

// One-time import of the marketing-page copy into the Pages collection (pages-be-1).
// Creates the 8 FIXED pages (never editor-created/deleted — BR-1) and imports every
// current section + item from the front-end page components (home sections1/2/3,
// about, lets-collaborate, and the collection index chrome). Coded-but-commented
// sections (Home Network/Insights/News, About Team/Culture) are seeded is_visible=
// false. Stat sections store a `stat_key` (SITE CompanyStat key or a derived metric)
// — never a number (BR-3). Collection-backed sections store chrome + max_items +
// source_key — never records (BR-4). Image URLs resolve to MediaAsset rows where
// Cloudinary; Unsplash placeholders → null (re-author). Idempotent: keyed on page.key
// (a page already present keeps its admin-edited sections — never re-seeded).

interface SeedItem {
  icon?: string
  image?: string
  tag?: string
  title?: string
  subtitle?: string
  body?: string
  value?: string
  unit?: string
  statKey?: string
  isActive?: boolean
  linkUrl?: string
  linkLabel?: string
  meta?: Prisma.InputJsonValue
}
interface SeedSection {
  type: SectionType
  isVisible?: boolean
  eyebrow?: string
  heading?: string
  subheading?: string
  body?: string
  variant?: string
  backgroundImage?: string
  ctaPrimaryLabel?: string
  ctaPrimaryUrl?: string
  ctaSecondaryLabel?: string
  ctaSecondaryUrl?: string
  maxItems?: number
  sourceKey?: string
  settings?: Prisma.InputJsonValue
  items?: SeedItem[]
}
interface SeedPage {
  key: PageKey
  path: string
  adminTitle: string
  seoMetaTitle: string
  seoMetaDescription: string
  sections: SeedSection[]
}

const EXPERTISE_ITEMS: SeedItem[] = [
  { tag: '01 - Public', title: 'Government Projects', image: 'https://res.cloudinary.com/dk4csiouq/image/upload/v1778307817/Picture22_iwei3q.jpg', body: 'Reliable execution for public infrastructure and development works under LGED, RHD and municipal tenders.', linkUrl: '/service-details/heavy-civil-infrastructure-development', linkLabel: 'Explore Sector' },
  { tag: '03 - Private', title: 'Private Projects', image: 'https://res.cloudinary.com/dk4csiouq/image/upload/v1777110616/21_jdwj2x.jpg', body: 'Premium residential homes, apartments and private buildings with disciplined quality finishing.', linkUrl: '/service-details/heavy-civil-infrastructure-development', linkLabel: 'Explore Sector' },
  { tag: '02 - Commercial', title: 'Commercial Projects', image: 'https://res.cloudinary.com/dk4csiouq/image/upload/v1778306310/Picture1_nb2vhy.jpg', body: 'Modern solutions for business buildings, industrial facilities and commercial developments across Bangladesh.', linkUrl: '/service-details/heavy-civil-infrastructure-development', linkLabel: 'Explore Sector' },
]

const HOME_STAT_ITEMS: SeedItem[] = [
  { statKey: 'years_experience', title: 'Years Experience', subtitle: 'Established operations since 2010' },
  { statKey: 'projects_count', title: 'Projects Delivered', subtitle: 'Across public & private sectors' },
  { statKey: 'districts_covered', title: 'District Reach', subtitle: 'Nationwide execution capability' },
  { statKey: 'team_size', title: 'Skilled Team', subtitle: 'Engineers, managers, technicians' },
]

const PAGES_SEED: SeedPage[] = [
  // ─────────────────────────────────────────────────────── HOME
  {
    key: 'home',
    path: '/',
    adminTitle: 'Home Page',
    seoMetaTitle: 'Zakir Enterprise — Construction & Infrastructure in Bangladesh',
    seoMetaDescription: "Bangladesh's foundation of strength & trust. Government, commercial and private construction delivered with disciplined execution across 64 districts.",
    sections: [
      {
        type: 'hero',
        variant: 'skyline',
        subheading: 'Building Bangladesh Since 2010',
        heading: 'Strength in Every Build, Precision in Every Detail',
        body: "Zakir Enterprise: Bangladesh's Foundation of Strength & Trust. From site development to large-scale infrastructure, Zakir Enterprise is your trusted partner for high-quality construction that stands the test of time.",
        backgroundImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=2000&q=80&auto=format&fit=crop',
        ctaPrimaryLabel: 'Contact Us',
        ctaPrimaryUrl: '/lets-collaborate',
        ctaSecondaryLabel: 'Explore Project',
        ctaSecondaryUrl: '/projects',
        settings: { ticker: 'NATIONWIDE - SINCE 2010', bottom: 'Dhaka - Chattogram - Sylhet - Khulna - Rajshahi' },
        items: [
          { title: 'Nationwide Operations', subtitle: '64 districts' },
          { title: 'Quality Execution', subtitle: 'ISO aligned' },
          { title: 'Experienced Team', subtitle: '250+ specialists' },
          { title: 'Timely Delivery', subtitle: '98% on schedule' },
        ],
      },
      {
        type: 'expertise_cards',
        eyebrow: 'CORE EXPERTISE / 03',
        heading: 'Capability across every scale of construction.',
        body: 'From government infrastructure to private developments, we operate with the same discipline, safety standards and delivery confidence on every site.',
        items: EXPERTISE_ITEMS,
      },
      {
        type: 'stat_strip',
        eyebrow: 'TRACK RECORD / 04',
        heading: 'Delivering confidence through results.',
        body: 'Over a decade of disciplined project delivery measured in completed contracts, satisfied clients and repeat government tenders.',
        items: HOME_STAT_ITEMS,
      },
      {
        type: 'about_intro',
        subheading: 'About Zakir Enterprise',
        heading: 'Building more than structures — building trust.',
        body: 'Zakir Enterprise is a Bangladesh-based construction company committed to quality, safety and long-term value. Our teams operate across all 64 districts with an experienced core of engineers and site managers capable of handling contracts from municipal works to large commercial developments.',
        backgroundImage: 'https://res.cloudinary.com/dk4csiouq/image/upload/v1778308523/WhatsApp_Image_2026-05-09_at_12.32.27_PM_evnsal.jpg',
        ctaPrimaryLabel: 'Learn More About Us',
        ctaPrimaryUrl: '/about',
        settings: { overlay: { value: '15', unit: '+', label: 'Years delivering public & private works' } },
        items: [
          { title: 'Disciplined site execution' },
          { title: 'Safety-first methodology' },
          { title: 'Transparent project reporting' },
          { title: 'Local supply chain depth' },
        ],
      },
      {
        type: 'featured_projects',
        eyebrow: 'FEATURED PROJECTS / 06',
        heading: 'Work that stands on its ground.',
        body: 'A selection of recent completions across public infrastructure, commercial structures and foundation works — engineered to last, delivered on time.',
        ctaPrimaryLabel: 'View All Projects',
        ctaPrimaryUrl: '/projects',
        sourceKey: 'projects.featured',
        maxItems: 6,
      },
      {
        type: 'featured_services',
        eyebrow: 'SERVICES / 07',
        heading: 'A full-spectrum construction partner.',
        body: 'Eleven core service lines each handled by specialized teams with the equipment, methodology and accountability the work demands.',
        ctaPrimaryLabel: 'View All Services',
        ctaPrimaryUrl: '/services',
        sourceKey: 'services.featured',
        maxItems: 6,
      },
      {
        type: 'network_strip',
        isVisible: false,
        eyebrow: 'BUSINESS NETWORK / 08',
        heading: 'Our business network.',
        body: 'A family of concerns covering construction, materials, logistics and development — vertically aligned to keep quality and schedule under one roof.',
        sourceKey: 'concerns.published',
        maxItems: 4,
      },
      {
        type: 'logo_wall',
        subheading: 'Trusted by Government & Industry',
        heading: "Selected clients & partners we've served.",
        items: ['LGED', 'RHD', 'BWDB', 'PWD', 'DPHE', 'CITY CORP.', 'BPDB', 'DESCO', 'BSCIC', 'BEZA', 'RAJUK', 'EPZ'].map((t) => ({ title: t })),
      },
      {
        type: 'featured_certifications',
        eyebrow: 'CERTIFICATIONS / 09',
        heading: 'Standards you can trust.',
        body: 'Independently verified against international and national standards — our certifications are current, audited and available for tender review on request.',
        ctaPrimaryLabel: 'View All Certifications',
        ctaPrimaryUrl: '/certifications',
        sourceKey: 'certifications.home-seals',
        maxItems: 4,
      },
      {
        type: 'testimonials',
        subheading: 'Client Voice',
        heading: 'What clients say after the last truck leaves the site.',
        body: 'Our reputation is built on what happens after handover — buildings that perform, roads that hold, bridges that stand.',
        items: [
          { body: 'Professional execution and timely completion. Highly dependable team on every milestone of our facility build.', title: 'Engr. Rafiqul Islam', subtitle: 'Project Director · LGED Cumilla Region', meta: { initials: 'RI' } },
          { body: 'Strong communication, quality work and excellent site management - the kind of contractor you want on a complex tender.', title: 'Tanvir Ahmed', subtitle: 'Infrastructure Lead · Private EPZ Developer', meta: { initials: 'TA' } },
          { body: 'A trusted partner for demanding infrastructure works. Delivered our bridge project with full engineering discipline.', title: 'Farhana Rahman', subtitle: 'Chief Engineer · Regional Authority', meta: { initials: 'FR' } },
        ],
      },
      {
        type: 'insights_strip',
        isVisible: false,
        eyebrow: 'INSIGHTS / 12',
        heading: 'Industry thinking from our field teams.',
        body: 'Notes on construction methodology, safety practices and the infrastructure landscape in Bangladesh - written by the engineers doing the work.',
        sourceKey: 'blog.featured',
        maxItems: 4,
      },
      {
        type: 'news_strip',
        isVisible: false,
        eyebrow: 'COMPANY NEWS / 13',
        heading: "What's happening at Zakir Enterprise.",
        ctaPrimaryLabel: 'All News & Announcements',
        ctaPrimaryUrl: '/news',
        sourceKey: 'news.featured',
        maxItems: 4,
      },
      {
        type: 'cta_banner',
        subheading: "Let's Build Together",
        heading: "Let's build your next project together.",
        body: 'From planning to execution, Zakir Enterprise is ready to deliver quality work with confidence and professionalism - on schedule, on budget, on standard.',
        backgroundImage: 'https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=2000&q=80&auto=format&fit=crop',
        ctaPrimaryLabel: "Let's Collaborate",
        ctaPrimaryUrl: '/lets-collaborate',
        ctaSecondaryLabel: 'Discuss Project',
        ctaSecondaryUrl: '/lets-collaborate',
        items: [
          { title: 'Response', subtitle: 'Within 24 hours' },
          { title: 'Site Visit', subtitle: 'Free nationwide' },
          { title: 'Estimate', subtitle: 'Detailed BOQ included' },
          { title: 'Contract', subtitle: 'Transparent terms' },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────────────────── ABOUT
  {
    key: 'about',
    path: '/about',
    adminTitle: 'About Page',
    seoMetaTitle: 'About Zakir Enterprise — Building Excellence Through Quality & Trust',
    seoMetaDescription: 'A leading construction and engineering company in Bangladesh with 16+ years delivering infrastructure, commercial and residential projects.',
    sections: [
      {
        type: 'hero',
        subheading: 'ZAKIR ENTERPRISE',
        heading: 'Building Excellence Through Quality, Innovation & Trust',
        body: 'Zakir Enterprise is a leading construction and engineering company in Bangladesh with over 16 years of experience, delivering high-quality infrastructure, commercial, and residential projects through expert planning, advanced technology, and a strong commitment to safety, sustainability, and client satisfaction.',
        backgroundImage: 'https://res.cloudinary.com/dk4csiouq/image/upload/v1779519653/WhatsApp_Image_2026-05-23_at_1.00.00_PM_q7uvum.jpg',
        ctaPrimaryLabel: 'Explore Our Projects',
        ctaPrimaryUrl: '/projects',
        ctaSecondaryLabel: 'Get in Touch',
        ctaSecondaryUrl: '/lets-collaborate',
        settings: { stamp: { value: '15', unit: '+', label: 'Years of Engineering' } },
      },
      {
        type: 'story',
        subheading: 'Our Story',
        heading: 'Building Visions Into Reality',
        body: 'Zakir Enterprise was established with a vision to deliver reliable and high-quality construction solutions across Bangladesh. Over the past 16+ years, the company has developed strong expertise in construction management, engineering design, and project execution, becoming a trusted partner for both public and private sector projects.',
        ctaPrimaryLabel: 'Discover Our Work',
        ctaPrimaryUrl: '/projects',
        settings: { badge: 'Since 2010' },
        items: [
          { statKey: 'years_experience', title: 'Years of Experience' },
          { statKey: 'projects_count', title: 'Projects' },
          { statKey: 'team_size', title: 'Team' },
          { statKey: 'districts_covered', title: 'Districts' },
          { image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80&auto=format&fit=crop', tag: 'collage' },
          { image: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=900&q=80&auto=format&fit=crop', tag: 'collage' },
        ],
      },
      {
        type: 'expertise_cards',
        eyebrow: 'OUR CAPABILITIES',
        heading: 'Eleven disciplines. One contractor.',
        body: 'Our expertise covers a comprehensive range of construction and engineering services across Bangladesh.',
        items: [
          { icon: 'building', tag: '01', title: 'Building Construction (Residential & Commercial)', body: 'Commercial, residential & institutional builds.' },
          { icon: 'road', tag: '02', title: 'Road Construction & Infrastructure Development', body: 'Highways, urban roads & site roadworks.' },
          { icon: 'bridge', tag: '03', title: 'Bridge and Culvert Construction', body: 'RCC bridge & culvert engineering and delivery.' },
          { icon: 'earth', tag: '04', title: 'Earthwork & Land Development', body: 'Excavation, grading and site preparation.' },
          { icon: 'drain', tag: '05', title: 'Drainage System Construction', body: 'Stormwater, sewerage and rainwater systems.' },
          { icon: 'concrete', tag: '06', title: 'Structural Concrete Works', body: 'RCC frame, slab & shear-wall construction.' },
          { icon: 'foundation', tag: '07', title: 'Foundation Engineering Works', body: 'Bored piling, pad and raft foundations.' },
          { icon: 'renov', tag: '08', title: 'Renovation & Maintenance Services', body: 'Retrofits, repairs and long-term maintenance.' },
          { icon: 'finish', tag: '09', title: 'Finishing & Interior Works', body: 'Premium finishing, interiors and exteriors.' },
          { icon: 'special', tag: '10', title: 'Specialized Construction Solutions', body: 'Complex custom engineering scopes.' },
          { icon: 'equip', tag: '11', title: 'Construction Equipment & Machinery Support', body: 'Plant, crane and equipment systems.' },
        ],
      },
      {
        type: 'mvv',
        eyebrow: 'FOUNDATIONS / 04',
        heading: 'Our Mission, Vision & Values',
        body: 'The principles that guide every estimate we submit, every site we mobilise, and every handover we sign off.',
        items: [
          { title: 'Mission', body: 'To deliver high-quality construction and engineering services by transforming client visions into reality while maintaining the highest standards of safety, sustainability, and excellence.' },
          { title: 'Vision', body: 'To be a leading construction company in Bangladesh, recognized for innovation, technical expertise, and a strong commitment to quality, sustainability, and client satisfaction.' },
          { title: 'Core Values', meta: { values: ['Quality', 'Integrity', 'Innovation', 'Safety', 'Sustainability'] } },
        ],
      },
      {
        type: 'timeline',
        subheading: 'Work Process',
        heading: 'Our Journey of Growth',
        body: 'Over more than 16 years, Zakir Enterprise has built a strong foundation through experience, technical expertise, and successful project execution across Bangladesh.',
        items: [
          { value: '2010', title: 'Company Founded', body: 'Established strong expertise in construction management and project execution' },
          { value: '2012', title: 'First Major Project', body: 'Successfully delivered diverse public and private sector projects' },
          { value: '2015', title: 'Road & Civil Expansion', body: 'Expanded capabilities across infrastructure, industrial, and building construction' },
          { value: '2018', title: 'Regional Growth', body: 'Adopted modern engineering techniques and construction technologies', isActive: true },
          { value: '2023', title: 'Large-Scale Projects', body: 'Earned trust through consistent quality and timely project delivery' },
          { value: 'Next', title: 'Future Vision', body: 'Strengthened focus on safety, sustainability, and long-term client relationships' },
        ],
      },
      {
        type: 'leadership_message',
        subheading: 'MESSAGE FROM MANAGEMENT',
        heading: 'Commitment to Excellence',
        body: 'At Zakir Enterprise, we believe construction is more than building structures - it is about creating lasting value through expertise, innovation, and responsible execution. We emphasize strong coordination between engineering, planning, and execution teams to maintain quality standards, meet timelines, and exceed client expectations.',
        backgroundImage: 'https://s3.ap-south-1.amazonaws.com/emr.buckett/WhatsApp%20Image%202025-10-18%20at%209.50.02%20AM.jpeg',
        settings: { signature: { name: 'Abu Zakir', role: 'Founder & Managing Director' }, quote: 'We are dedicated to delivering construction solutions that reflect quality, integrity, and long-term value for our clients and communities.' },
      },
      {
        type: 'leadership_team',
        isVisible: false,
        eyebrow: 'OUR MANAGEMENT TEAM',
        heading: 'Experienced & Dedicated Leadership',
        body: 'Our management team consists of experienced professionals with expertise in engineering, project management, construction execution, and administrative operations.',
      },
      {
        type: 'why_us',
        eyebrow: 'WHY CHOOSE US',
        heading: 'Why clients trust Zakir Enterprise.',
        body: "Eight operational commitments that show up on every contract - whether it's a Tk 2cr culvert or a Tk 200cr commercial tower.",
        items: [
          { title: 'Systematic and process-driven project execution', body: '100+ completed projects with documented QA sign-off.' },
          { title: 'Strong technical expertise backed by experienced engineering teams', body: 'Experienced engineers, surveyors and site supervisors.' },
          { title: 'Consistent quality control and adherence to construction standards', body: 'Operating across every district of Bangladesh.' },
          { title: 'Strict safety practices across all project sites', body: 'BIM-driven planning and weekly client reviews.' },
          { title: 'Transparent coordination with clients and stakeholders', body: 'Certified safety protocols on every site.' },
          { title: 'Commitment to durable, sustainable, and long-lasting construction', body: 'Track record of on-time and ahead-of-schedule delivery.' },
          { title: 'Transparent Communication', body: 'Clear reporting, budgets and change-order processes.' },
          { title: 'Quality Assurance', body: 'Three-stage QA, materials testing and handover audits.' },
        ],
      },
      {
        type: 'achievements',
        subheading: 'By the Numbers',
        heading: 'Over 16 years of proven construction excellence',
        items: [
          { statKey: 'projects_count', title: 'Successfully Completed Diverse Construction Projects' },
          { statKey: 'years_experience', title: 'Years Experience' },
          { statKey: 'team_size', title: 'Workforce' },
          { statKey: 'districts_covered', title: 'Engagements' },
          { statKey: 'client_confidence_pct', title: 'Client Confidence' },
        ],
      },
      {
        type: 'culture',
        isVisible: false,
        eyebrow: 'OUR TEAM',
        heading: 'Driven by Expertise and Commitment',
        body: 'Our strength lies in a dedicated team of engineers, project managers, technical specialists, and skilled workers who bring professionalism, discipline, and experience to every project.',
        items: [
          { title: 'Strong project accountability and responsibility', body: 'Trained engineers and field teams with continuous development.' },
          { title: 'Quality-focused execution at every stage', body: 'Zero-compromise PPE, toolbox talks and incident reviews.' },
          { title: 'Strict adherence to safety standards', body: 'Tolerances and QA protocols checked at every stage.' },
          { title: 'Effective teamwork and coordination', body: 'Clear ownership from project manager to site foreman.' },
        ],
      },
      {
        type: 'clients_filterable',
        eyebrow: 'OUR PROJECT PARTNERS',
        heading: 'Trusted Across Major Projects in Bangladesh',
        settings: { sectors: ['All', 'Government', 'Residential', 'Commercial', 'Infrastructure'] },
        items: [
          { title: 'MINISTRY OF PWD', tag: 'Government' },
          { title: 'LGED', tag: 'Government' },
          { title: 'RHD', tag: 'Infrastructure' },
          { title: 'RAJUK', tag: 'Government' },
          { title: 'BRIDGE AUTHORITY', tag: 'Infrastructure' },
          { title: 'WASA', tag: 'Infrastructure' },
          { title: 'BADC', tag: 'Government' },
          { title: 'BWDB', tag: 'Infrastructure' },
          { title: 'CITY CORPORATION', tag: 'Government' },
          { title: 'HOUSING & PW', tag: 'Residential' },
          { title: 'ASSURE GROUP', tag: 'Commercial' },
          { title: 'NAVANA REAL ESTATE', tag: 'Residential' },
          { title: 'BAY DEVELOPMENTS', tag: 'Commercial' },
          { title: 'BTI', tag: 'Residential' },
          { title: 'CONCORD GROUP', tag: 'Commercial' },
          { title: 'RUET', tag: 'Government' },
        ],
      },
      {
        type: 'final_cta',
        subheading: 'Start the Conversation',
        heading: 'Ready to build with confidence?',
        body: 'Partner with Zakir Enterprise for reliable construction and engineering excellence from initial consultation through handover and long-term maintenance.',
        ctaPrimaryLabel: 'Request Consultation',
        ctaPrimaryUrl: '/lets-collaborate',
        ctaSecondaryLabel: 'View Portfolio',
        ctaSecondaryUrl: '/projects',
      },
    ],
  },
  // ─────────────────────────────────────────────────────── LET'S COLLABORATE
  {
    key: 'lets_collaborate',
    path: '/lets-collaborate',
    adminTitle: "Let's Collaborate Page",
    seoMetaTitle: "Let's Collaborate — Zakir Enterprise",
    seoMetaDescription: 'From private developments to government-scale infrastructure, collaborate, quote and build with Zakir Enterprise across all 64 districts of Bangladesh.',
    sections: [
      {
        type: 'hero',
        subheading: 'Collaborate - Quote - Build',
        heading: "Let's Build Something Great Together",
        body: 'From private developments to government-scale infrastructure, Zakir Enterprise is ready to collaborate, quote and execute with confidence across all 64 districts of Bangladesh.',
        backgroundImage: 'https://res.cloudinary.com/dk4csiouq/image/upload/v1778497992/Collobarote_Hero_fgpdk5.jpg',
        ctaPrimaryLabel: "Let's Collaborate",
        ctaPrimaryUrl: '#form',
        ctaSecondaryLabel: 'Call Now',
        ctaSecondaryUrl: 'tel:+8801791026074',
        settings: { desk: [{ k: 'Response', v: 'Within 2 working days' }, { k: 'Languages', v: 'English - Bangla' }, { k: 'Coverage', v: 'All 64 districts' }] },
      },
      {
        type: 'trust_hook',
        heading: 'We collaborate with developers, businesses, institutions and government stakeholders to deliver quality construction solutions across Bangladesh.',
        items: ['Nationwide Capability', 'Skilled Workforce', 'Timely Delivery', 'Trusted Execution', 'Multi-Sector Expertise'].map((t) => ({ title: t })),
      },
      {
        type: 'intent_cards',
        eyebrow: 'HOW CAN WE HELP / 01',
        heading: "Tell us what you're here for.",
        body: 'Pick the intent that best matches your project - we will route it straight to the relevant Zakir Enterprise team and prefill your inquiry form below.',
        items: [
          { tag: 'quote', icon: 'building', title: "Let's Collaborate", body: 'Priced scope for a defined construction brief.' },
          { tag: 'new', icon: 'concrete', title: 'New Construction Project', body: 'Start a fresh development from concept to delivery.' },
          { tag: 'collab', icon: 'special', title: 'Request Collaboration', body: 'Joint execution on complex or multi-party builds.' },
          { tag: 'gov', icon: 'road', title: 'Government Project', body: 'LGED, RHD, PWD tenders and institutional works.' },
          { tag: 'tender', icon: 'finish', title: 'Bid / Tender Inquiry', body: 'Subcontract partnership for active bid opportunities.' },
          { tag: 'vendor', icon: 'equip', title: 'Vendor / Supplier', body: 'Material, machinery or specialist supply partnership.' },
          { tag: 'sub', icon: 'drain', title: 'Subcontracting', body: 'Trade subcontracting for ongoing Zakir sites.' },
          { tag: 'partner', icon: 'foundation', title: 'Partnership Discussion', body: 'Long-term strategic or joint-venture partnership.' },
          { tag: 'general', icon: 'renov', title: 'General Inquiry', body: 'Anything else - we will route it to the right team.' },
        ],
      },
      {
        type: 'contact_panel',
        eyebrow: 'START A CONVERSATION / 02',
        heading: "Share your project. We'll take it from there.",
        body: 'Tell us about your site, scope and timeline. Our project team responds within two working days with a structured next step. (Contact values resolve from SITE.)',
      },
    ],
  },
]

// Collection index pages (hero + featured/stat chrome + CTA). Index hero/intro/CTA
// chrome is PAGES-owned (resolving the deferred references in the collection SRSs §11.C).
const INDEX_PAGES: SeedPage[] = [
  {
    key: 'projects_index',
    path: '/projects',
    adminTitle: 'Projects Index',
    seoMetaTitle: 'Projects — Zakir Enterprise',
    seoMetaDescription: 'Built across Bangladesh — government, commercial and private construction projects delivered with disciplined execution.',
    sections: [
      { type: 'hero', eyebrow: 'Our Projects', heading: 'Built across Bangladesh.', body: 'A portfolio of public infrastructure, commercial structures and private developments — engineered to last and delivered on schedule.', ctaPrimaryLabel: 'Browse Full Portfolio', ctaPrimaryUrl: '/projects' },
      { type: 'featured_projects', eyebrow: 'FEATURED / 02', heading: 'Featured work.', sourceKey: 'projects.featured', maxItems: 6 },
      { type: 'final_cta', heading: 'Have a project in mind?', body: "Let's discuss your scope, timeline and budget.", ctaPrimaryLabel: "Let's Collaborate", ctaPrimaryUrl: '/lets-collaborate' },
    ],
  },
  {
    key: 'services_index',
    path: '/services',
    adminTitle: 'Services Index',
    seoMetaTitle: 'Services — Zakir Enterprise',
    seoMetaDescription: 'A full-spectrum construction partner — eleven core service lines delivered nationwide with engineering precision.',
    sections: [
      { type: 'hero', eyebrow: 'What We Deliver', heading: 'A full-spectrum construction partner.', body: 'Eleven core service lines each handled by specialized teams with the equipment, methodology and accountability the work demands.', ctaPrimaryLabel: "Let's Collaborate", ctaPrimaryUrl: '/lets-collaborate' },
      { type: 'featured_services', heading: 'Our service lines.', sourceKey: 'services.featured', maxItems: 11 },
      { type: 'final_cta', heading: 'Need a specific service?', body: 'Tell us about your scope and we will route it to the right team.', ctaPrimaryLabel: 'Get in Touch', ctaPrimaryUrl: '/lets-collaborate' },
    ],
  },
  {
    key: 'blog_index',
    path: '/blogs',
    adminTitle: 'Blog Index',
    seoMetaTitle: 'Insights & Articles — Zakir Enterprise',
    seoMetaDescription: 'Editorial perspective from the field — construction methodology, safety practice and the infrastructure landscape in Bangladesh.',
    sections: [
      { type: 'hero', eyebrow: 'Insights & Articles', heading: 'Editorial Perspective', body: 'Industry thinking from our field teams — written by the engineers doing the work.', ctaPrimaryLabel: 'View All Articles', ctaPrimaryUrl: '/blogs' },
      { type: 'final_cta', heading: "Let's build together.", body: 'From planning to execution, we deliver quality work with confidence.', ctaPrimaryLabel: "Let's Collaborate", ctaPrimaryUrl: '/lets-collaborate' },
    ],
  },
  {
    key: 'news_index',
    path: '/news',
    adminTitle: 'News Index',
    seoMetaTitle: 'News Corner — Zakir Enterprise',
    seoMetaDescription: 'Announcements, achievements, awarded projects and milestones from across our active portfolio.',
    sections: [
      { type: 'hero', eyebrow: 'News Corner', heading: "What's happening at Zakir Enterprise.", body: 'Real, measurable work — delivered by real teams at real sites.', ctaPrimaryLabel: 'All News', ctaPrimaryUrl: '/news' },
      { type: 'final_cta', heading: 'Media or partnership enquiries?', body: 'Reach our project desk for a structured next step.', ctaPrimaryLabel: 'Contact Us', ctaPrimaryUrl: '/lets-collaborate' },
    ],
  },
  {
    key: 'certifications_index',
    path: '/certifications',
    adminTitle: 'Certifications Index',
    seoMetaTitle: 'Certifications — Zakir Enterprise',
    seoMetaDescription: 'Credentials, licenses and enlistments — independently verified, current and available for tender review.',
    sections: [
      { type: 'hero', eyebrow: 'Certifications', heading: 'Standards you can trust.', body: 'Independently verified against international and national standards — current, audited and available for tender review on request.', ctaPrimaryLabel: 'Get in Touch', ctaPrimaryUrl: '/lets-collaborate' },
      { type: 'featured_certifications', heading: 'Our credentials.', sourceKey: 'certifications.home-seals', maxItems: 8 },
      { type: 'final_cta', heading: 'Need our compliance pack?', body: 'Request our certification documents for tender review.', ctaPrimaryLabel: 'Request Documents', ctaPrimaryUrl: '/lets-collaborate' },
    ],
  },
]

async function ensureMedia(db: PrismaClient, rawUrl: string | undefined, actorId: string | null): Promise<string | null> {
  if (!rawUrl) return null
  const url = rawUrl.trim()
  const parsed = parseCloudinaryUrl(url)
  if (!parsed) return null
  const existing = await db.mediaAsset.findFirst({ where: { publicId: parsed.publicId }, select: { id: true } })
  if (existing) return existing.id
  const filename = parsed.publicId.split('/').pop() ?? parsed.publicId
  const created = await db.mediaAsset.create({
    data: { resourceType: 'image', provider: 'cloudinary', publicId: parsed.publicId, url, format: parsed.format, originalFilename: `${filename}.${parsed.format}`, tags: ['pages'], createdById: actorId, updatedById: actorId },
  })
  return created.id
}

export async function seedPages(db: PrismaClient): Promise<void> {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  let createdPages = 0
  let skipped = 0
  const all = [...PAGES_SEED, ...INDEX_PAGES]

  for (const page of all) {
    const existing = await db.page.findUnique({ where: { key: page.key }, select: { id: true } })
    if (existing) {
      skipped++
      continue
    }

    const created = await db.page.create({
      data: {
        status: 'published',
        publishedAt: new Date(),
        key: page.key,
        path: page.path,
        adminTitle: page.adminTitle,
        seoMetaTitle: page.seoMetaTitle,
        seoMetaDescription: page.seoMetaDescription,
        createdById: actorId,
        updatedById: actorId,
      },
    })

    for (const [sIdx, section] of page.sections.entries()) {
      const bgId = await ensureMedia(db, section.backgroundImage, actorId)
      const sectionRow = await db.pageSection.create({
        data: {
          pageId: created.id,
          type: section.type,
          position: sIdx,
          isVisible: section.isVisible ?? true,
          eyebrow: section.eyebrow ?? null,
          heading: section.heading ?? null,
          subheading: section.subheading ?? null,
          body: section.body ?? null,
          variant: section.variant ?? null,
          backgroundImageId: bgId,
          ctaPrimaryLabel: section.ctaPrimaryLabel ?? null,
          ctaPrimaryUrl: section.ctaPrimaryUrl ?? null,
          ctaSecondaryLabel: section.ctaSecondaryLabel ?? null,
          ctaSecondaryUrl: section.ctaSecondaryUrl ?? null,
          maxItems: section.maxItems ?? null,
          sourceKey: section.sourceKey ?? null,
          settings: section.settings ?? Prisma.JsonNull,
        },
      })
      if (section.items?.length) {
        for (const [iIdx, item] of section.items.entries()) {
          const imageId = await ensureMedia(db, item.image, actorId)
          await db.sectionItem.create({
            data: {
              sectionId: sectionRow.id,
              position: iIdx,
              icon: item.icon ?? null,
              imageId,
              tag: item.tag ?? null,
              title: item.title ?? null,
              subtitle: item.subtitle ?? null,
              body: item.body ?? null,
              value: item.value ?? null,
              unit: item.unit ?? null,
              statKey: item.statKey ?? null,
              isActive: item.isActive ?? false,
              linkUrl: item.linkUrl ?? null,
              linkLabel: item.linkLabel ?? null,
              meta: item.meta ?? Prisma.JsonNull,
            },
          })
        }
      }
    }
    createdPages++
  }

  console.log(`Pages seed: ${createdPages} pages imported, ${skipped} already present (${all.length} fixed pages; sections + items per §8.5). Idempotent.`)
}
