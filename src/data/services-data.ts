export interface ServiceMetaItem {
  k: string;
  v: string;
}

export interface ServiceOverview {
  title: string;
  lead: string;
  body: string[];
  bullets: string[];
}

export interface ServiceScopeItem {
  icon: string;
  title: string;
  body: string;
}

export interface ServiceProcessItem {
  tag: string;
  title: string;
  body: string;
}

export interface ServiceBenefitItem {
  icon: string;
  title: string;
  body: string;
}

export interface ServiceMachineItem {
  t: string;
  d: string;
}

export interface ServiceRelatedItem {
  img: string;
  cat: string;
  loc: string;
  type: string;
  title: string;
  line: string;
}

export interface ServiceFaqItem {
  q: string;
  a: string;
}

export interface ServiceRecord {
  slug: string;
  title: string;
  icon: string;
  serviceNo: number;
  totalServices: number;
  subtitle: string;
  heroImage: string;
  machineImage: string;
  ctaImage: string;
  meta: ServiceMetaItem[];
  overview: ServiceOverview;
  scope: ServiceScopeItem[];
  process: ServiceProcessItem[];
  benefits: ServiceBenefitItem[];
  machine: ServiceMachineItem[];
  related: ServiceRelatedItem[];
  faq: ServiceFaqItem[];
}

interface ServiceSeed {
  slug: string;
  title: string;
  icon: string;
  subtitle: string;
  heroImage: string;
  machineImage: string;
}

const SERVICE_SEEDS: ServiceSeed[] = [
  {
    slug: "heavy-civil-infrastructure-development",
    title: "Heavy Civil Infrastructure Development",
    icon: "building",
    subtitle:
      "From highway corridors and river crossings to large-scale earthworks and national infrastructure projects — executed nationwide with engineering precision, safety compliance and on-time delivery.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777715088/1._Heavy_Civil_Infrastructure_Development_Hero_project_jqyazu.png",
    machineImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777715084/1._Heavy_Civil_Infrastructure_Development_execution_cvygyc.png",
  },
  {
    slug: "integrated-road-and-highway-construction",
    title: "Integrated Road & Highway Construction",
    icon: "road",
    subtitle:
      "End-to-end roadway solutions from subgrade to surfacing with traffic-safe phasing, QA-led materials and milestone control.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306679/a0ec6bd9-91aa-49ea-8dfa-29cc1457378e_iwfpka.jpg",
    machineImage:
      "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1200&q=80&auto=format&fit=crop",
  },
  {
    slug: "bridge-culvert-and-structural-engineering-works",
    title: "Bridge, Culvert & Structural Engineering Works",
    icon: "bridge",
    subtitle:
      "Bridge and culvert systems engineered for load performance, hydraulic resilience and long-term structural integrity.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306796/Bridge_-_Hero_hysfta.jpg",
    machineImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777265050/SKCD_updated_hero_1_ndt0oa.jpg",
  },
  {
    slug: "large-scale-earthwork-and-land-development",
    title: "Large-Scale Earthwork & Land Development",
    icon: "earth",
    subtitle:
      "Bulk excavation, filling, grading and stabilization for industrial, urban and infrastructure-ready land transformation.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306900/Earthwork-_Hero_b2iq6d.jpg",
    machineImage:
      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80&auto=format&fit=crop",
  },
   {
    slug: "river-training-dredging-and-canal-development",
    title: "River Training, Dredging & Canal Development",
    icon: "renov",
    subtitle:
      "Hydraulic improvement and protection works for riverbanks, canals and waterways in erosion-prone and silted corridors.",
    heroImage:
      "https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1590590032559-8e03e7e2e9ef?w=1200&q=80&auto=format&fit=crop",
  },
    {
    slug: "heavy-equipment-supply-rental-and-operation",
    title: "Heavy Equipment Supply, Rental & Operation",
    icon: "special",
    subtitle:
      "Reliable heavy machinery access with trained operators, maintenance assurance and deployment planning for active sites.",
    heroImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=1200&q=80&auto=format&fit=crop",
  },
  {
    slug: "drainage-sewer-and-water-infrastructure-systems",
    title: "Drainage, Sewer & Water Infrastructure Systems",
    icon: "drain",
    subtitle:
      "Underground and surface water management networks designed for reliability, compliance and urban flood mitigation.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778307032/Piling-Hero_bqxeu8.jpg",
    machineImage:
      "https://images.unsplash.com/photo-1545622783-b3e021430fee?w=1200&q=80&auto=format&fit=crop",
  },
  {
    slug: "piling-rcc-and-structural-construction",
    title: "Piling, RCC & Structural Construction",
    icon: "concrete",
    subtitle:
      "Foundation and reinforced structural systems executed with strict QA/QC, testing protocols and precision methods.",
    heroImage:
      "https://images.unsplash.com/photo-1565008576549-57569a49371c?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1518335935020-cfd6580c1ab4?w=1200&q=80&auto=format&fit=crop",
  },
  {
    slug: "industrial-and-environmental-engineering-projects-etp-utilities",
    title: "Industrial & Environmental Engineering Projects (ETP, Utilities)",
    icon: "foundation",
    subtitle:
      "Industrial utility and treatment infrastructure delivered with process-safety alignment and regulatory readiness.",
    heroImage:
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop",
  },
 
  {
    slug: "finishing-work-and-end-engineering-design",
    title: "Finishing work and End Engineering Design ",
    icon: "finish",
    subtitle:
      "Integrated engineering management from concept and planning to contractor coordination, control and delivery closeout.",
    heroImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop",
  },
  
  {
    slug: "building-construction-residential-commercial-and-industrial",
    title: "Building Construction (Residential, Commercial & Industrial)",
    icon: "equip",
    subtitle:
      "From multi-storey commercial facilities to institutional and residential builds with safety-led execution and schedule discipline.",
    heroImage:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&q=80&auto=format&fit=crop",
  },
];

const BASE_SCOPE: ServiceScopeItem[] = [
  {
    icon: "building",
    title: "Planning & Design Coordination",
    body: "Feasibility review, requirement mapping, BoQ alignment and constructability checks before site start.",
  },
  {
    icon: "earth",
    title: "Site Preparation & Mobilization",
    body: "Survey, logistics setup, temporary utilities and phased mobilization tailored to project constraints.",
  },
  {
    icon: "foundation",
    title: "Core Engineering Execution",
    body: "Method-driven execution by specialized crews with daily engineering supervision and quality hold-points.",
  },
  {
    icon: "concrete",
    title: "Integrated Trade Coordination",
    body: "Civil, structural and utility interfaces coordinated through sequencing plans and progress tracking.",
  },
  {
    icon: "finish",
    title: "Testing & Commissioning",
    body: "Inspection plans, compliance checks and functional testing completed before delivery sign-off.",
  },
  {
    icon: "special",
    title: "Handover & Documentation",
    body: "Structured closure with as-built documentation, snag closure and formal client handover process.",
  },
];

const BASE_PROCESS: ServiceProcessItem[] = [
  {
    tag: "Phase 01",
    title: "Consult & Scope",
    body: "Client consultation, site context review and scope finalization.",
  },
  {
    tag: "Phase 02",
    title: "Plan & Estimate",
    body: "Program scheduling, resource planning and transparent commercial estimate.",
  },
  {
    tag: "Phase 03",
    title: "Mobilize Site",
    body: "Workfront setup, safety onboarding and logistics activation.",
  },
  {
    tag: "Phase 04",
    title: "Execute & Monitor",
    body: "Milestone-led execution with QA/QC review and progress reporting.",
  },
  {
    tag: "Phase 05",
    title: "Commission & Handover",
    body: "Testing, closure and final operational handover.",
  },
];

const BASE_BENEFITS: ServiceBenefitItem[] = [
  {
    icon: "building",
    title: "Proven Delivery Experience",
    body: "Multi-sector execution capability developed through government and private contracts.",
  },
  {
    icon: "special",
    title: "Quality Assurance Discipline",
    body: "Structured quality checkpoints and documented compliance at each critical stage.",
  },
  {
    icon: "equip",
    title: "Safety-First Site Culture",
    body: "HSE-led execution with trained supervision and active risk control on site.",
  },
  {
    icon: "road",
    title: "Milestone-Driven Execution",
    body: "Schedule-focused planning with transparent monitoring and recovery actions.",
  },
  {
    icon: "drain",
    title: "Skilled Team & Fleet",
    body: "Engineers, managers and operators deployed with project-specific resources.",
  },
  {
    icon: "renov",
    title: "Nationwide Reach",
    body: "Operational ability to deliver projects across Bangladesh under one management structure.",
  },
];

const BASE_MACHINE: ServiceMachineItem[] = [
  { t: "Heavy Lifting Fleet", d: "Cranes, lifting rigs and support units for structural operations." },
  { t: "Earthmoving Equipment", d: "Excavators, dozers, graders and compaction units for production works." },
  { t: "Structural Execution Tools", d: "Formwork, rebar and reinforced concrete systems for controlled delivery." },
  { t: "Utility Installation Systems", d: "Specialized tools for trenching, laying and utility integration." },
  { t: "Site Coordination Stack", d: "Planning, reporting and QA workflows for milestone tracking." },
  { t: "Testing & QA Support", d: "Material, dimensional and compliance testing protocols across phases." },
];

const BASE_RELATED: ServiceRelatedItem[] = [
  {
    img: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&q=80&auto=format&fit=crop",
    cat: "Government",
    loc: "Dhaka",
    type: "Ongoing",
    title: "Urban Infrastructure Package",
    line: "Integrated package delivered with phased execution, active logistics control and compliance-led quality assurance.",
  },
  {
    img: "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1200&q=80&auto=format&fit=crop",
    cat: "Institutional",
    loc: "Chattogram",
    type: "Delivered",
    title: "Regional Structural Upgrade",
    line: "Complex civil and structural scope delivered ahead of target with strong QA and stakeholder coordination.",
  },
  {
    img: "https://images.unsplash.com/photo-1621352452648-c717c4eba35f?w=1200&q=80&auto=format&fit=crop",
    cat: "Private",
    loc: "Banani, Dhaka",
    type: "Delivered",
    title: "Premium Development Project",
    line: "High-standard construction package executed with safety-led site management and disciplined finishing.",
  },
];

const CTA_IMAGE =
  "https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=2000&q=80&auto=format&fit=crop";

function buildService(seed: ServiceSeed, index: number, total: number): ServiceRecord {
  return {
    slug: seed.slug,
    title: seed.title,
    icon: seed.icon,
    serviceNo: index + 1,
    totalServices: total,
    subtitle: seed.subtitle,
    heroImage: seed.heroImage,
    machineImage: seed.machineImage,
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Infrastructure" },
      { k: "Execution Model", v: "End-to-End Delivery" },
      { k: "Delivery Reach", v: "All 64 districts" },
      { k: "Response Timeline", v: "Within 2 working days" },
    ],
    overview: {
      title: `${seed.title} executed with engineering discipline and measurable delivery control.`,
      lead: `Zakir Enterprise provides nationwide ${seed.title.toLowerCase()} support through dedicated engineering teams and structured workflows.`,
      body: [
        `Each ${seed.title.toLowerCase()} assignment is planned around project conditions, performance targets and regulatory requirements before execution begins.`,
        "From planning and mobilization to final handover, we coordinate resources, quality checkpoints and site safety under one accountable delivery team.",
      ],
      bullets: [
        "Project planning and constructability review",
        "Specialized engineering execution teams",
        "Milestone-based monitoring and reporting",
        "Quality and compliance documentation",
        "Safety-led site operations",
        "Structured project handover",
      ],
    },
    scope: BASE_SCOPE,
    process: BASE_PROCESS,
    benefits: BASE_BENEFITS,
    machine: BASE_MACHINE,
    related: BASE_RELATED,
    faq: [
      {
        q: `What does your ${seed.title.toLowerCase()} service include?`,
        a: "It covers planning, engineering execution, quality control, safety management and structured handover as one integrated package.",
      },
      {
        q: "How do you estimate project cost and timeline?",
        a: "After scope validation and site review, we provide a BoQ-backed quotation and milestone-linked delivery program.",
      },
      {
        q: "Can Zakir Enterprise deliver this service outside Dhaka?",
        a: "Yes. We execute projects nationwide using regional mobilization plans and central project controls.",
      },
      {
        q: "How do you ensure quality during execution?",
        a: "We apply stage-wise QA/QC checkpoints, testing records and compliance sign-offs throughout delivery.",
      },
    ],
  };
}

export const SERVICES: ServiceRecord[] = SERVICE_SEEDS.map((seed, index, all) =>
  buildService(seed, index, all.length),
);

export function getServiceBySlug(slug: string): ServiceRecord | undefined {
  const normalizedSlug = slug.trim().toLowerCase();
  return SERVICES.find((service) => service.slug.toLowerCase() === normalizedSlug);
}

export function getServiceSlugByTitle(title: string): string | undefined {
  const normalizedTitle = title.trim().toLowerCase();
  return SERVICES.find((service) => service.title.trim().toLowerCase() === normalizedTitle)?.slug;
}
