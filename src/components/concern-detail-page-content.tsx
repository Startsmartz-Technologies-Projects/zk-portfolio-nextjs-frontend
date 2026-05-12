"use client";

import * as React from "react";
import { Arrow, ArrowUpRight, SvcIcon } from "./site-ui";

const BASE_CONCERN = {
  name: "Zakir Construction Ltd.",
  short: "Civil & Infrastructure",
  tagline: "Building the backbone of modern Bangladesh.",
  intro:
    "The flagship civil construction arm of Zakir Enterprise Group, delivering public infrastructure, commercial buildings and heavy civil works across 64 districts.",
  hero: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=2000&q=80&auto=format&fit=crop",
  est: "Est. 2014",
  code: "ZCL / 01",
  overview: {
    title: "A civil works partner, not a subcontractor.",
    body: [
      "Zakir Construction Ltd. is the principal civil engineering concern under Zakir Enterprise Group. We serve as the primary delivery arm for government infrastructure tenders, private commercial developments and industrial-scale site works across Bangladesh.",
      "Our engineering, quality and safety disciplines are built for large-scale civil packages, from mat foundations in Dhaka's alluvial soil to bridge structures across seasonal rivers.",
    ],
    mission: "Engineer infrastructure that performs for its full design life, on schedule, on budget, with zero compromise on safety.",
  },
  facts: [
    { big: "11", label: "Years of Delivery", sub: "Since 2014" },
    { big: "100+", label: "Completed Projects", sub: "64 districts" },
    { big: "250+", label: "Skilled Workforce", sub: "On active sites" },
    { big: "64", label: "Districts Covered", sub: "Nationwide" },
    { big: "BDT 400Cr+", label: "Projects In Progress", sub: "Active portfolio" },
    { big: "5", label: "Specialized Plants", sub: "Batching & precast" },
  ],
  services: [
    { icon: "building", title: "Civil Construction", copy: "Multi-storey commercial, institutional and industrial buildings. Turnkey delivery from piling to handover." },
    { icon: "road", title: "Road Works & Highways", copy: "Flexible and rigid pavement delivery under RHD, LGED and Roads Division specifications." },
    { icon: "bridge", title: "Bridge & Culvert Works", copy: "Small-to-mid-span bridges, box culverts, pier and girder construction with in-house methodology." },
    { icon: "earth", title: "Earthwork & Site Development", copy: "Mass excavation, embankment, grading and stabilization for industrial and institutional sites." },
    { icon: "foundation", title: "Foundation Engineering", copy: "Bored pile, driven pile, raft and pad foundations with full geotechnical oversight." },
    { icon: "concrete", title: "Structural Concrete", copy: "RCC frames, shear walls, precast elements supported by in-house batching capacity." },
    { icon: "drain", title: "Drainage & Utilities", copy: "Storm and sewer networks, box drains, pump chambers and service utility packages." },
    { icon: "renov", title: "Renovation & Retrofit", copy: "Structural strengthening, seismic retrofit and heritage-sensitive renovation projects." },
    { icon: "equip", title: "Equipment Services", copy: "In-house fleet of excavators, pavers, rollers, batching plants and bridge launching gantries." },
  ],
  why: [
    { big: "01", title: "Skilled Workforce", copy: "A standing team of engineers, supervisors and skilled operators, not a dispatch list." },
    { big: "02", title: "Proven Delivery", copy: "100+ completed projects under public and private clients with dependable outcomes." },
    { big: "03", title: "Quality Control", copy: "ISO 9001:2015 aligned processes with strict structural testing gates." },
    { big: "04", title: "Safety Compliance", copy: "OSHA-aligned HSE protocol and active site-level monitoring culture." },
    { big: "05", title: "Fast Execution", copy: "A nine-gate delivery protocol that compresses schedule without compromising quality." },
    { big: "06", title: "Reliable Support", copy: "Dedicated project desk responds within two working days with structured follow-up." },
  ],
  projects: [
    {
      title: "Dhaka Corridor Road Package",
      location: "Dhaka Division",
      category: "Highway",
      summary: "BDT 180 crore four-lane corridor under the Roads & Highways Department.",
      image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1400&q=80&auto=format&fit=crop",
    },
    {
      title: "Cumilla Industrial Park",
      location: "Cumilla - BEZA",
      category: "Earthwork",
      summary: "BDT 95 crore site development with drainage and utilities packages.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80&auto=format&fit=crop",
    },
    {
      title: "Padma South Connector",
      location: "Shariatpur",
      category: "Bridge",
      summary: "Civil works package on the Padma South corridor with phased superstructure delivery.",
      image: "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1400&q=80&auto=format&fit=crop",
    },
    {
      title: "Narayanganj Batching Plant",
      location: "Narayanganj",
      category: "Plant",
      summary: "120 m3/hour high-capacity concrete facility for in-house supply chain reliability.",
      image: "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1400&q=80&auto=format&fit=crop",
    },
    {
      title: "Sylhet LGED Rural Roads",
      location: "Sylhet Division",
      category: "Roads",
      summary: "Three LGED packages with 42 km of rural infrastructure, culverts and drainage.",
      image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1400&q=80&auto=format&fit=crop",
    },
    {
      title: "Chattogram Industrial Access",
      location: "Chattogram",
      category: "Award",
      summary: "Infrastructure category winner in 2025 Construction Excellence Award cycle.",
      image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1400&q=80&auto=format&fit=crop",
    },
  ],
  process: [
    { step: "01", title: "Consultation", copy: "Site walk, scope review and preliminary engineering brief with no-obligation consultation." },
    { step: "02", title: "Planning & Design", copy: "Method statement, schedule, BOQ verification and geotechnical review by named engineers." },
    { step: "03", title: "Mobilization", copy: "Camp, plant, access and utility setup with HSE induction before day one." },
    { step: "04", title: "Site Execution", copy: "Phased delivery with weekly progress reporting and field data logging." },
    { step: "05", title: "Quality Assurance", copy: "Structural testing checkpoints across each gate before handover readiness." },
    { step: "06", title: "Handover & DLP", copy: "Documented handover with as-built drawings and defects liability support." },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=1200&q=80&auto=format&fit=crop",
  ],
  related: [
    { name: "Zakir Engineering Works", desc: "Industrial plant, steel fabrication and specialized mechanical systems.", tag: "Mechanical" },
    { name: "Zakir Plant & Machinery", desc: "Heavy equipment leasing, maintenance and operator training services.", tag: "Equipment" },
    { name: "Zakir Trading & Supply", desc: "Construction materials procurement including steel, cement and utilities.", tag: "Supply Chain" },
    { name: "Zakir Real Estate Ltd.", desc: "Commercial and residential development projects under the group portfolio.", tag: "Real Estate" },
  ],
  faqs: [
    {
      q: "What services does Zakir Construction Ltd. provide?",
      a: "Civil construction, road works, bridge and culvert construction, earthwork, foundation engineering, structural concrete, drainage and utility works with turnkey delivery coverage.",
    },
    {
      q: "Does the concern work nationwide?",
      a: "Yes, the concern supports projects across all 64 districts through regional mobilization capacity and central engineering oversight.",
    },
    {
      q: "How do I request a quotation?",
      a: "Use the contact page to share scope, site location and timeline. A named engineer responds within two working days.",
    },
    {
      q: "Do you handle government tenders?",
      a: "Yes, with active experience across RHD, LGED and other institutional tender frameworks.",
    },
    {
      q: "What is your safety record?",
      a: "Safety is managed through OSHA-aligned procedures, active supervision and routine compliance reviews.",
    },
    {
      q: "Can the team manage full project lifecycle delivery?",
      a: "Yes, from pre-tender consultation through planning, execution, handover and post-completion support.",
    },
  ],
};

const CONCERNS = {
  "zakir-enterprise": {
    ...BASE_CONCERN,
    name: "Zakir Enterprise",
    short: "Construction & Infrastructure",
    tagline: "Integrated delivery across civil works, logistics and development.",
    intro:
      "The parent concern of the group, coordinating engineering, project controls and execution governance for nationwide construction delivery.",
    hero: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=2000&q=80&auto=format&fit=crop",
    code: "ZE / 00",
    est: "Est. 2012",
    facts: [
      { big: "14", label: "Years in Operation", sub: "Since 2012" },
      { big: "180+", label: "Projects Delivered", sub: "Cross-sector portfolio" },
      { big: "64", label: "District Coverage", sub: "Nationwide presence" },
      { big: "420+", label: "Core Workforce", sub: "Engineers & field teams" },
      { big: "BDT 650Cr+", label: "Active Portfolio", sub: "Current pipeline" },
      { big: "4", label: "Strategic Concerns", sub: "Integrated operations" },
    ],
    services: [
      { icon: "building", title: "Program Management", copy: "Multi-package planning, governance and delivery oversight across concern units." },
      { icon: "road", title: "Infrastructure Delivery", copy: "End-to-end highway, utility and public works execution for institutional clients." },
      { icon: "bridge", title: "Major Structures", copy: "Bridge and complex structural packages coordinated across design and construction teams." },
      { icon: "earth", title: "Site Mobilization", copy: "Regional setup, logistics planning and early-stage enabling works at speed." },
      { icon: "drain", title: "Utility Integration", copy: "Drainage, service corridors and utility interfaces managed through single-point controls." },
      { icon: "equip", title: "Fleet & Resource Control", copy: "Plant and equipment deployment aligned with live schedule and productivity benchmarks." },
    ],
    projects: [
      {
        title: "National Corridor Program Office",
        location: "Dhaka",
        category: "Program",
        summary: "Central PMO delivery framework coordinating seven concurrent infrastructure contracts.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Western Flood Resilience Package",
        location: "Khulna Division",
        category: "Infrastructure",
        summary: "Integrated embankment, drainage and access road package for climate-resilient mobility.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Urban Mobility Flyover Works",
        location: "Chattogram",
        category: "Structures",
        summary: "City-scale transport structure with phased traffic management and rapid handover.",
        image: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "District Utility Upgrade Cluster",
        location: "Rajshahi & Rangpur",
        category: "Utilities",
        summary: "Multi-district pipeline, drainage and service corridor upgrade delivered under one command desk.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=80&auto=format&fit=crop",
      },
    ],
    faqs: [
      {
        q: "What does Zakir Enterprise coordinate at group level?",
        a: "It coordinates planning, controls, quality governance and cross-concern resource alignment across major programs.",
      },
      {
        q: "Can the group deliver multi-package projects under one contract strategy?",
        a: "Yes, the group runs consolidated planning and reporting for complex, multi-scope project portfolios.",
      },
      {
        q: "How quickly can a project mobilization plan be issued?",
        a: "Typical initial mobilization frameworks are shared within two working days after scope review.",
      },
      {
        q: "Do you provide executive-level project reporting?",
        a: "Yes, milestone and risk reporting is prepared for client decision-makers at agreed review intervals.",
      },
      {
        q: "Is delivery handled directly or outsourced?",
        a: "Core delivery is managed through in-house concern units with accountable engineering ownership.",
      },
      {
        q: "How do clients start engagement with the parent concern?",
        a: "Share project scope through the collaboration page; the program desk will assign a lead team.",
      },
    ],
  },
  "zakir-concrete-works": {
    ...BASE_CONCERN,
    name: "Zakir Concrete Works",
    short: "Materials & Precast",
    tagline: "Concrete supply built for consistency, speed and structural reliability.",
    intro:
      "Specialized in ready-mix concrete, precast elements and quality-controlled aggregate supply for infrastructure and industrial projects.",
    hero: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=2000&q=80&auto=format&fit=crop",
    code: "ZCW / 02",
    est: "Est. 2016",
    overview: {
      ...BASE_CONCERN.overview,
      title: "Concrete that meets spec, batch after batch.",
      mission: "Provide high-performance concrete systems with tested quality and dependable dispatch.",
    },
    facts: [
      { big: "9", label: "Years of Operations", sub: "Since 2016" },
      { big: "2", label: "Batching Plants", sub: "Dhaka & Narayanganj" },
      { big: "160 m3/hr", label: "Combined Capacity", sub: "Peak output" },
      { big: "1,200+", label: "Mix Designs Delivered", sub: "Commercial & infrastructure" },
      { big: "24/7", label: "Dispatch Window", sub: "By schedule" },
      { big: "100%", label: "Batch Test Logging", sub: "Digital traceability" },
    ],
    services: [
      { icon: "concrete", title: "Ready-Mix Concrete", copy: "Pumped and transit-mixed concrete supply across structural and pavement applications." },
      { icon: "building", title: "Precast Elements", copy: "Precast slabs, drains and custom structural members for accelerated site programs." },
      { icon: "foundation", title: "High-Strength Mixes", copy: "Engineered M35+ mixes for heavy foundation and industrial load requirements." },
      { icon: "road", title: "Pavement Concrete", copy: "Mixes tuned for rigid pavement performance under road authority specifications." },
      { icon: "drain", title: "Drainage Components", copy: "Concrete products for box drains, utility chambers and service network packages." },
      { icon: "equip", title: "On-Site Pumping Support", copy: "Boom pump and placement teams synchronized with pour windows and QA checkpoints." },
    ],
    projects: [
      {
        title: "Narayanganj Plant Capacity Upgrade",
        location: "Narayanganj",
        category: "Plant",
        summary: "Capacity expansion project with automated batching controls and moisture correction.",
        image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Dhaka Elevated Structure Supply",
        location: "Dhaka",
        category: "Supply",
        summary: "Scheduled high-strength concrete supply for urban elevated structural sections.",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Cumilla Precast Utility Package",
        location: "Cumilla",
        category: "Precast",
        summary: "Production and delivery of precast drainage modules for rapid municipal deployment.",
        image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Industrial Foundation Pour Program",
        location: "Gazipur",
        category: "Concrete",
        summary: "Continuous pour planning and quality supervision for heavy industrial raft foundations.",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80&auto=format&fit=crop",
      },
    ],
    faqs: [
      {
        q: "What products does Zakir Concrete Works supply?",
        a: "Ready-mix concrete, precast components, specialized structural mixes and on-site pumping support.",
      },
      {
        q: "Can you support high-volume pours with strict timing?",
        a: "Yes, dispatch windows are coordinated with production scheduling and placement teams.",
      },
      {
        q: "Do you provide batch-level quality records?",
        a: "Yes, test logs and production records are maintained for every supply sequence.",
      },
      {
        q: "Are custom mix designs available?",
        a: "Yes, mixes are tuned to project strength, workability and durability requirements.",
      },
      {
        q: "Which regions are covered for delivery?",
        a: "Primary service is centered around Dhaka-adjacent industrial and infrastructure zones with planned expansion.",
      },
      {
        q: "How are supply disruptions managed?",
        a: "Contingency dispatch plans and backup fleet support are used to keep pours on schedule.",
      },
    ],
  },
  "zakir-transport-equipment": {
    ...BASE_CONCERN,
    name: "Zakir Transport & Equipment",
    short: "Logistics & Plant",
    tagline: "Heavy movement, site mobilization and machinery uptime under one desk.",
    intro:
      "The logistics and equipment concern supporting project mobilization, heavy haulage, fleet management and operator readiness across regions.",
    hero: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=2000&q=80&auto=format&fit=crop",
    code: "ZTE / 03",
    est: "Est. 2015",
    overview: {
      ...BASE_CONCERN.overview,
      title: "Fleet reliability that keeps schedules intact.",
      mission: "Deliver safe, on-time movement of materials, machinery and teams to every site package.",
    },
    facts: [
      { big: "10", label: "Years in Service", sub: "Since 2015" },
      { big: "140+", label: "Fleet Assets", sub: "Heavy & support vehicles" },
      { big: "6", label: "Regional Hubs", sub: "Operational base points" },
      { big: "98.7%", label: "Fleet Uptime", sub: "Rolling 12-month average" },
      { big: "24/7", label: "Dispatch Monitoring", sub: "Live coordination desk" },
      { big: "320+", label: "Operators & Drivers", sub: "Certified workforce" },
    ],
    services: [
      { icon: "equip", title: "Heavy Equipment Rental", copy: "Excavators, rollers, pavers and support machinery with trained operators." },
      { icon: "earth", title: "Mass Haulage Logistics", copy: "Bulk movement planning for earthworks, aggregates and project materials." },
      { icon: "road", title: "Road-Ready Transport", copy: "Permit-aware routing and movement plans for oversized plant relocation." },
      { icon: "foundation", title: "Site Mobilization Support", copy: "Pre-start deployment of equipment, access setup and staging logistics." },
      { icon: "building", title: "Operator Deployment", copy: "Certified operator assignment with shift planning for critical path activities." },
      { icon: "drain", title: "Maintenance & Recovery", copy: "Field maintenance units and recovery response to minimize downtime on active sites." },
    ],
    projects: [
      {
        title: "National Fleet Digitization Program",
        location: "Dhaka HQ",
        category: "Operations",
        summary: "Telemetry and dispatch control integration across high-utilization fleet categories.",
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Sylhet Earthwork Logistics Chain",
        location: "Sylhet",
        category: "Logistics",
        summary: "End-to-end haulage and machine rotation plan for accelerated earthwork delivery.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Bridge Launch Equipment Mobilization",
        location: "Madaripur",
        category: "Mobilization",
        summary: "Heavy movement package for bridge launching systems with phased road permits.",
        image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Regional Plant Support Framework",
        location: "Rajshahi & Bogura",
        category: "Fleet",
        summary: "Distributed maintenance and standby unit model for remote project continuity.",
        image: "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=1400&q=80&auto=format&fit=crop",
      },
    ],
    faqs: [
      {
        q: "What equipment does Zakir Transport & Equipment provide?",
        a: "It provides heavy construction plant, support machinery and certified operators for active projects.",
      },
      {
        q: "Can you handle oversized equipment movement permits?",
        a: "Yes, route and compliance planning is included in large-scale transport assignments.",
      },
      {
        q: "How is uptime maintained on critical jobs?",
        a: "Preventive maintenance, standby assets and field recovery teams are deployed by priority schedule.",
      },
      {
        q: "Do you support short-notice mobilization?",
        a: "Yes, rapid mobilization is available based on fleet availability and location windows.",
      },
      {
        q: "Are operators included with rentals?",
        a: "Yes, operator deployment is available with machine assignments where required.",
      },
      {
        q: "How do clients request fleet support?",
        a: "Submit scope and schedule through the project desk for fleet planning and slot confirmation.",
      },
    ],
  },
  "zakir-real-estate": {
    ...BASE_CONCERN,
    name: "Zakir Real Estate",
    short: "Urban Development",
    tagline: "Planned residential and mixed-use developments for growing cities.",
    intro:
      "Focused on residential and mixed-use development with integrated design coordination, construction oversight and lifecycle asset thinking.",
    hero: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=2000&q=80&auto=format&fit=crop",
    code: "ZRE / 04",
    est: "Est. 2018",
    overview: {
      ...BASE_CONCERN.overview,
      title: "Development programs designed for long-term livability.",
      mission: "Develop high-quality urban spaces that balance design value, buildability and end-user comfort.",
    },
    facts: [
      { big: "8", label: "Years in Development", sub: "Since 2018" },
      { big: "12", label: "Live Projects", sub: "Residential & mixed-use" },
      { big: "1.8M sqft", label: "Planned GFA", sub: "Pipeline footprint" },
      { big: "4", label: "Cities Active", sub: "Urban focus markets" },
      { big: "91%", label: "On-Time Handover", sub: "Recent cycles" },
      { big: "1000+", label: "Units in Delivery", sub: "Phased completion" },
    ],
    services: [
      { icon: "building", title: "Mixed-Use Development", copy: "Integrated retail, office and residential development planning and delivery." },
      { icon: "foundation", title: "Residential Projects", copy: "Apartment and gated community projects optimized for usability and durability." },
      { icon: "concrete", title: "Design Coordination", copy: "Architectural, structural and MEP coordination for buildable design outcomes." },
      { icon: "road", title: "Urban Access Planning", copy: "Traffic and connectivity planning for project ingress, egress and mobility." },
      { icon: "renov", title: "Asset Repositioning", copy: "Redevelopment and retrofit strategies for existing underperforming properties." },
      { icon: "drain", title: "Utility & Amenity Planning", copy: "Integrated service, landscape and amenity packages for full-lifecycle value." },
    ],
    projects: [
      {
        title: "Gulshan Mixed-Use Block A",
        location: "Dhaka",
        category: "Mixed-Use",
        summary: "Signature urban development blending office, retail and serviced living spaces.",
        image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Banani Residential Towers",
        location: "Dhaka",
        category: "Residential",
        summary: "Mid-rise residential cluster focused on daylight, ventilation and efficient unit planning.",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Chattogram Urban Hub",
        location: "Chattogram",
        category: "Commercial",
        summary: "Transit-adjacent commercial development with phased tenant readiness strategy.",
        image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1400&q=80&auto=format&fit=crop",
      },
      {
        title: "Sylhet Community Living Estate",
        location: "Sylhet",
        category: "Community",
        summary: "Master-planned community with civic amenities, green space and long-term service planning.",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1400&q=80&auto=format&fit=crop",
      },
    ],
    faqs: [
      {
        q: "What does Zakir Real Estate specialize in?",
        a: "It focuses on residential and mixed-use developments with integrated planning and execution oversight.",
      },
      {
        q: "Are projects design-led or contractor-led?",
        a: "Projects are design-coordinated and buildability-reviewed before delivery commitments are finalized.",
      },
      {
        q: "Do you manage utility and amenity planning internally?",
        a: "Yes, service systems and amenity planning are integrated into early design and delivery phases.",
      },
      {
        q: "Which cities are currently prioritized?",
        a: "Current emphasis is on Dhaka, Chattogram, Sylhet and other high-growth urban locations.",
      },
      {
        q: "Can buyers and partners request project briefings?",
        a: "Yes, structured project briefings can be arranged through the collaboration desk.",
      },
      {
        q: "How is handover quality assured?",
        a: "Handover follows phased QA checklists with documented closure before occupancy readiness.",
      },
    ],
  },
} as const;

type ConcernId = keyof typeof CONCERNS;

const RELATED_CONCERNS = [
  {
    slug: "zakir-enterprise",
    name: "Zakir Enterprise",
    desc: "Construction & infrastructure execution parent concern.",
    tag: "Core",
  },
  {
    slug: "zakir-concrete-works",
    name: "Zakir Concrete Works",
    desc: "Ready-mix concrete, precast elements and structural aggregate supply.",
    tag: "Materials",
  },
  {
    slug: "zakir-transport-equipment",
    name: "Zakir Transport & Equipment",
    desc: "Heavy machinery, hauling and on-site equipment rental across regions.",
    tag: "Logistics",
  },
  {
    slug: "zakir-real-estate",
    name: "Zakir Real Estate",
    desc: "Mixed-use and residential development projects in urban Bangladesh.",
    tag: "Development",
  },
] as const;

const DEFAULT_CONCERN_ID: ConcernId = "zakir-enterprise";

export function ConcernDetailPageContent({ concernId = DEFAULT_CONCERN_ID }: { concernId?: string }) {
  const [openFaq, setOpenFaq] = React.useState(0);
  const activeConcernId = (concernId in CONCERNS ? concernId : DEFAULT_CONCERN_ID) as ConcernId;
  const concern = CONCERNS[activeConcernId];
  const relatedConcerns = RELATED_CONCERNS.filter((item) => item.slug !== activeConcernId);

  return (
    <>
      <section className="cd-hero">
        <div className="cd-hero-bg" style={{ backgroundImage: `url(${concern.hero})` }} />
        <div className="container cd-hero-inner">
          <div className="bg-crumbs" style={{ marginBottom: 28 }}>
            <a href="/">Home</a>
            <span className="sep">/</span>
            <a href="/">Concerns</a>
            <span className="sep">/</span>
            <span className="current">{concern.short}</span>
          </div>
          <div className="cd-hero-badge">
            <div className="cd-hero-badge-mark">Z</div>
            <div className="cd-hero-badge-body">
              <div className="cd-hero-badge-unit">Concern - Zakir Enterprise Group</div>
              <div className="cd-hero-badge-code">
                {concern.code} - {concern.est}
              </div>
            </div>
          </div>
          <h1>{concern.name}</h1>
          <p className="cd-hero-tag">{concern.tagline}</p>
          <p className="cd-hero-sub">{concern.intro}</p>
          <div className="cd-hero-ctas">
            <a href="/lets-collaborate" className="btn btn-primary">
              Contact This Concern <Arrow />
            </a>
            <a href="#projects" className="btn btn-outline-light">
              View Projects
            </a>
          </div>
          <div className="cd-hero-meta">
            <div className="m">
              <span className="k">Parent Group</span>
              <span className="v">Zakir Enterprise</span>
            </div>
            <div className="m">
              <span className="k">Scope</span>
              <span className="v">{concern.short}</span>
            </div>
            <div className="m">
              <span className="k">Coverage</span>
              <span className="v">64 Districts</span>
            </div>
            <div className="m">
              <span className="k">Status</span>
              <span className="v">
                <span className="dot-live" />Active &amp; Delivering
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="cd-overview">
        <div className="container cd-overview-grid">
          <div className="cd-overview-left">
            <span className="microlabel">Concern Overview</span>
            <h2>{concern.overview.title}</h2>
            <div className="cd-overview-quick">
              <div>
                <div className="n">2014</div>
                <div className="l">Established</div>
              </div>
              <div>
                <div className="n">100+</div>
                <div className="l">Projects</div>
              </div>
              <div>
                <div className="n">64</div>
                <div className="l">Districts</div>
              </div>
            </div>
          </div>
          <div className="cd-overview-right">
            {concern.overview.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="cd-mission">
              <div className="cd-mission-label">Mission</div>
              <blockquote>{concern.overview.mission}</blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="cd-facts">
        <div className="container">
          <div className="cd-facts-head">
            <div>
              <span className="microlabel on-dark">By The Numbers</span>
              <h2>
                A delivery record that <span className="accent">speaks for itself.</span>
              </h2>
            </div>
            <p>Every figure below is drawn from active project data. We publish what we can prove.</p>
          </div>
          <div className="cd-facts-grid">
            {concern.facts.map((fact, index) => (
              <div key={fact.label} className="cd-fact-card">
                <div className="cd-fact-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="cd-fact-big">{fact.big}</div>
                <div className="cd-fact-lbl">{fact.label}</div>
                <div className="cd-fact-sub">{fact.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-services" id="services">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel">Services & Capabilities</span>
              <h2>What this concern delivers.</h2>
            </div>
            <p>A full civil engineering stack, assembled in-house and delivered with accountable execution.</p>
          </div>
          <div className="cd-services-grid">
            {concern.services.map((service, index) => (
              <div key={service.title} className="cd-service-card">
                <div className="cd-service-icon">
                  <SvcIcon kind={service.icon} />
                </div>
                <div className="cd-service-num">{String(index + 1).padStart(2, "0")}</div>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <span className="cd-service-more">
                  Learn more <Arrow size={12} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-why">
        <div className="container cd-why-grid">
          <div className="cd-why-aside">
            <span className="microlabel">Why Choose Us</span>
            <h2>
              Six reasons clients
              <br />
              come back for project two.
            </h2>
            <p>The industry has many contractors. We aim to be the one you do not need to chase.</p>
            <a href="/lets-collaborate" className="btn btn-dark">
              Start a Conversation <Arrow />
            </a>
          </div>
          <div className="cd-why-list">
            {concern.why.map((item) => (
              <div key={item.big} className="cd-why-item">
                <div className="cd-why-num">{item.big}</div>
                <div className="cd-why-body">
                  <h4>{item.title}</h4>
                  <p>{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-projects" id="projects">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel">Featured Projects</span>
              <h2>
                Delivery speaks
                <br />
                louder than positioning.
              </h2>
            </div>
            <a href="/projects" className="btn btn-outline-dark">
              View All Projects <Arrow />
            </a>
          </div>
          <div className="cd-projects-grid">
            {concern.projects.map((project, index) => (
              <a key={project.title} className={`cd-project-card ${index === 0 ? "wide" : ""}`} href="/projects" style={{ textDecoration: "none" }}>
                <div className="cd-project-img" style={{ backgroundImage: `url(${project.image})` }}>
                  <span className="cd-project-cat">{project.category}</span>
                </div>
                <div className="cd-project-body">
                  <div className="cd-project-loc">{project.location}</div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <span className="cd-project-more">
                    View Project <ArrowUpRight size={12} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-process">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel on-dark">Work Process</span>
              <h2>A six-stage delivery protocol.</h2>
            </div>
            <p>Every project follows the same discipline from first site walk to final defects review.</p>
          </div>
          <div className="cd-process-track">
            {concern.process.map((step, index) => (
              <div key={step.step} className="cd-process-step">
                <div className="cd-process-connector">
                  <span className="cd-process-dot" />
                  {index < concern.process.length - 1 && <span className="cd-process-line" />}
                </div>
                <div className="cd-process-body">
                  <div className="cd-process-num">{step.step}</div>
                  <h4>{step.title}</h4>
                  <p>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-gallery">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel">Field Gallery</span>
              <h2>
                Site conditions.
                <br />
                Engineering reality.
              </h2>
            </div>
            <p>Imagery from active and recently completed projects across this concern portfolio.</p>
          </div>
          <div className="cd-gallery-grid">
            {concern.gallery.map((image, index) => (
              <div key={image} className={`cd-gallery-cell g-${index}`} style={{ backgroundImage: `url(${image})` }}>
                <div className="cd-gallery-tag">{String(index + 1).padStart(2, "0")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-related">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel">Zakir Enterprise Group</span>
              <h2>Explore other concerns.</h2>
            </div>
            <p>One group, multiple specialized concerns, shared delivery discipline.</p>
          </div>
          <div className="cd-related-grid">
            {relatedConcerns.map((item, index) => (
              <a key={item.slug} className="cd-related-card" href={`/concern-detail/${item.slug}`} style={{ textDecoration: "none" }}>
                <div className="cd-related-index">{String(index + 2).padStart(2, "0")}</div>
                <span className="cd-related-tag">{item.tag}</span>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
                <span className="cd-related-arrow">
                  <ArrowUpRight />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-faq">
        <div className="container cd-faq-grid">
          <div>
            <span className="microlabel">Frequently Asked</span>
            <h2>
              Answers before
              <br />
              you ask them.
            </h2>
            <p>Cannot find what you are looking for? Our project desk responds within two working days.</p>
            <a href="/lets-collaborate" className="btn btn-dark">
              Ask the Project Desk <Arrow />
            </a>
          </div>

          <div className="cd-faq-list">
            {concern.faqs.map((faq, index) => (
              <div key={faq.q} className={`cd-faq-item ${openFaq === index ? "open" : ""}`}>
                <button type="button" className="cd-faq-q" onClick={() => setOpenFaq((prev) => (prev === index ? -1 : index))}>
                  <span className="cd-faq-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="cd-faq-text">{faq.q}</span>
                  <span className="cd-faq-sign">{openFaq === index ? "-" : "+"}</span>
                </button>
                <div className="cd-faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-cta">
        <div
          className="cd-cta-bg"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=2000&q=80&auto=format&fit=crop)",
          }}
        />
        <div className="container cd-cta-grid">
          <div>
            <span className="microlabel on-dark">Start Here</span>
            <h2>
              Work with <span className="accent">{concern.name}</span>
              <br />
              on your next project.
            </h2>
          </div>
          <div className="cd-cta-right">
            <p>Tell us your scope, site and timeline. A named engineer will respond with structured next steps and indicative budget guidance.</p>
            <div className="cd-cta-btns">
              <a href="/lets-collaborate" className="btn btn-primary">
                Contact Us <Arrow />
              </a>
              <a href="/lets-collaborate" className="btn btn-outline-light">
                Get a Quote
              </a>
            </div>
            <div className="cd-cta-contact">
              <div>
                <span className="k">Project Desk</span>
                <span className="v">+8801791026074</span>
              </div>
              <div>
                <span className="k">Email</span>
                <span className="v">zakirenterprise307@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

