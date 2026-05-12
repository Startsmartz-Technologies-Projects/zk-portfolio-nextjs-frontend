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
  scopeTitle: string;
  scopeLead: string;
  processTitle: string;
  processLead: string;
  benefitsTitle: string;
  benefitsLead: string;
  capabilityTitle: string;
  capabilityLead: string;
  capabilityBodyTitle: string;
  capabilityBodyDesc: string;
  faqTitle: string;
  faqLead: string;
  scope: ServiceScopeItem[];
  process: ServiceProcessItem[];
  benefits: ServiceBenefitItem[];
  machine: ServiceMachineItem[];
  faq: ServiceFaqItem[];
}

const CTA_IMAGE =
  "https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=2000&q=80&auto=format&fit=crop";

export const SERVICES: ServiceRecord[] = [
  // ─── 1. Heavy Civil Infrastructure Development ───────────────────────────
  {
    slug: "heavy-civil-infrastructure-development",
    title: "Heavy Civil Infrastructure Development",
    icon: "building",
    serviceNo: 1,
    totalServices: 11,
    subtitle:
      "From highway corridors and river crossings to large-scale earthworks and national infrastructure projects — executed nationwide with engineering precision, safety compliance and on-time delivery.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777715088/1._Heavy_Civil_Infrastructure_Development_Hero_project_jqyazu.png",
    machineImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777715084/1._Heavy_Civil_Infrastructure_Development_execution_cvygyc.png",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Infrastructure" },
      { k: "Project Scale", v: "District to National" },
      { k: "Delivery Reach", v: "All 64 Districts" },
      { k: "Typical Timeline", v: "6 – 48 Months" },
    ],
    // SERVICE OVERVIEW / 01
    overview: {
      title:
        "Heavy civil infrastructure, engineered for national impact.",
      lead:
        "Zakir Enterprise delivers large-scale civil infrastructure works across Bangladesh — from road and bridge corridors to flood embankments, culverts and utility infrastructure.",
      body: [
        "From initial survey through final commissioning, every Zakir Enterprise infrastructure project is led by an integrated team of civil engineers, site supervisors, quality controllers and experienced field crews. Our civil works cover earthworks and grading, reinforced concrete structures, drainage and hydraulic systems, road pavement layers, bridge substructures and superstructures, and coordinated utility installations.",
      ],
      bullets: [
        "RCC & steel bridge structures",
        "Highway & road corridor works",
        "Embankment & flood protection",
        "Drainage & hydraulic structures",
        "Utility & service infrastructure",
        "Site development & earthworks",
      ],
    },
    // SCOPE OF WORK / 02
    scopeTitle: "End-to-end capability under one delivery team.",
    scopeLead: "From earliest planning through final handover, we execute every stage in-house with dedicated engineers, equipment and site supervision.",
    // EXECUTION PROCESS / 03
    processTitle: "A disciplined five-stage delivery workflow.",
    processLead: "Every project we undertake moves through the same structured stages — transparent, measurable and built to keep timelines and quality on track.",
    // WHY ZAKIR ENTERPRISE / 04
    benefitsTitle: "Chosen for delivery discipline, not just lowest bid.",
    benefitsLead: "Government agencies, development partners and private developers return to us because we execute on commitment — safely, on schedule and to specification.",
    // EXECUTION STRENGTH / 05
    capabilityTitle: "Equipment, methods & site discipline.",
    capabilityLead: "From lattice boom cranes and production earthmoving units to concrete batching and QA testing — our fleet is maintained and deployed under engineering supervision on every site.",
    capabilityBodyTitle: "Operational capability built for scale and compliance.",
    capabilityBodyDesc: "Our execution strength is grounded in owned heavy equipment, proven civil construction methods and structured site management — supported by independent quality checks and full compliance documentation for every infrastructure delivery.",
    // FAQ
    faqTitle: "Questions from clients and stakeholders.",
    faqLead: "Clear, practical answers to the most common questions we receive from government bodies, developers and project owners before engaging on an infrastructure contract.",
    // SCOPE OF WORK / 02
    scope: [
      {
        icon: "building",
        title: " Planning & Design Coordination Feasibility studies, alignment surveys, BoQ development and constructability reviews.",
        body: "",
      },
      {
        icon: "earth",
        title: "Site Clearance & Earthworks Survey, vegetation clearing, bulk excavation, dewatering, compaction and haul road setup.",
        body: "",
      },
      {
        icon: "foundation",
        title: "Foundation & Substructure Works Pile foundations, abutments, footings, retaining walls and waterproofing systems.",
        body: "",
      },
      {
        icon: "drain",
        title: "Superstructure & Pavement ExecutionGirder launching, deck casting, road sub-base, base course and asphalt surfacing.",
        body: "",
      },
      {
        icon: "road",
        title: "Drainage, Utilities & FinishingBox culverts, cross-drainage, kerbing, road marking and utility corridor coordination.",
        body: "",
      },
      {
        icon: "special",
        title: "Quality, Safety & HandoverMaterial testing, load trials, snagging, commissioning and structured client handover.",
        body: "",
      },
    ],
    // EXECUTION PROCESS / 03
    process: [
      {
        tag: "Phase 01",
        title: "Consult & Scope",
        body: "Client brief, site assessment and infrastructure requirement mapping.",
      },
      {
        tag: "Phase 02",
        title: "Plan & Estimate",
        body: "Detailed BoQ, construction schedule and transparent cost quotation.",
      },
      {
        tag: "Phase 03",
        title: "Mobilize Site",
        body: "Site setup, equipment deployment, workforce activation and haul logistics.",
      },
      {
        tag: "Phase 04",
        title: "Execute & Monitor",
        body: "Field execution with milestone reporting, QA/QC checks and safety audits.",
      },
      {
        tag: "Phase 05",
        title: "Commission & Handover",
        body: "Load testing, final inspection, documentation closure and formal client handover.",
      },
    ],
    // WHY ZAKIR ENTERPRISE / 04
    benefits: [
      {
        icon: "building",
        title: "A Decade of Delivery",
        body: "100+ infrastructure projects delivered across government and private sectors.",
      },
      {
        icon: "special",
        title: "Quality Assurance Discipline",
        body: "Structured QA/QC checkpoints, material testing and compliance sign-offs on every project.",
      },
      {
        icon: "equip",
        title: "Safety-First Site Culture",
        body: "HSE-trained supervision teams and strict site safety protocols enforced nationwide.",
      },
      {
        icon: "road",
        title: "On-Time Milestone Delivery",
        body: "Milestone-driven planning with active logistics control and progress reporting.",
      },
      {
        icon: "drain",
        title: "Skilled Workforce at Scale",
        body: "250+ direct engineers, site managers, operators and skilled tradespeople on deployment.",
      },
      {
        icon: "renov",
        title: "Nationwide Project Capability",
        body: "Active execution capability across all 64 districts of Bangladesh.",
      },
    ],
    // EXECUTION STRENGTH / 05
    machine: [
      { t: "Excavators & Bulldozers", d: "High-capacity earthmoving fleet for bulk cut and fill operations." },
      { t: "Concrete Batching Plants", d: "Controlled-mix supply with slump testing and cube sampling on site." },
      { t: "Road Paving Equipment", d: "Motor graders, vibratory rollers and asphalt pavers for road corridor works." },
      { t: "Cranes & Lifting Equipment", d: "50T–120T mobile and crawler cranes for bridge and structural lifts." },
      { t: "Survey & Layout Tools", d: "Total stations, GPS rovers and drone survey capability for alignment control." },
      { t: "Testing & QA Lab", d: "On-site cube, rebar, soil, CBR and compaction testing equipment." },
    ],
    // FREQUENTLY ASKED / 07

    faq: [
      {
        q: "",
        a: "",
      },
      {
        q: "",
        a: "",
      },
      {
        q: "",
        a: "",
      },
      {
        q: "",
        a: "",
      },
    ],
  },

  // ─── 2. Integrated Road & Highway Construction ──────────────────────────
  {
    slug: "integrated-road-and-highway-construction",
    title: "Integrated Road & Highway Construction",
    icon: "road",
    serviceNo: 2,
    totalServices: 11,
    subtitle:
      "End-to-end roadway solutions from subgrade to surfacing with traffic-safe phasing, QA-led materials and milestone control.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306679/a0ec6bd9-91aa-49ea-8dfa-29cc1457378e_iwfpka.jpg",
    machineImage:
      "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Road & Highway Construction" },
      { k: "Execution Model", v: "Subgrade to Surfacing" },
      { k: "Road Standards", v: "RHD / PWD Compliant" },
      { k: "Delivery Reach", v: "All 64 Districts" },
    ],
    overview: {
      title:
        "Road and highway construction delivered from subgrade preparation to final surfacing with schedule discipline and QA-led material control.",
      lead:
        "Zakir Enterprise provides integrated road and highway construction services spanning full pavement packages, drainage systems and safety infrastructure — managed as a single accountable delivery.",
      body: [
        "Our road construction teams are experienced in all pavement layers — from subgrade preparation and sub-base compaction to base course placement and bituminous surfacing — with material quality controlled through in-house testing and external lab verification.",
        "Traffic-safe phasing plans are developed before mobilization to minimize disruption on live roads, and milestone-linked scheduling ensures the project remains on-track from first earthwork to final line marking.",
      ],
      bullets: [
        "Full pavement package from subgrade to surfacing",
        "Drainage and culvert integration within road scope",
        "Traffic management planning on live corridors",
        "QA-controlled material selection and testing",
        "Road marking, signage and safety infrastructure",
        "Bridge approach works and transition zone handling",
      ],
    },
    scopeTitle: "Full pavement delivery from subgrade preparation to surfacing, drainage and road safety features.",
    scopeLead: "Each road package is executed in a defined sequence — earthwork, base layers, wearing surface, drainage and markings — with QA checkpoints and active traffic management throughout.",
    processTitle: "Five delivery phases from design review through pavement construction to final inspection.",
    processLead: "Road construction follows a layer-by-layer sequence — survey, subgrade, base, surfacing, drainage — with QA sign-off at each stage before the next begins.",
    benefitsTitle: "Selected for pavement quality, QA material control and traffic-safe phasing.",
    benefitsLead: "Road and highway clients choose us for our dedicated paving fleet, live-road traffic management capability and material testing at every pavement layer.",
    capabilityTitle: "Dedicated paving fleet from subgrade preparation to final bituminous surfacing.",
    capabilityLead: "Graders, asphalt pavers, compaction rollers, bitumen sprayers and concrete equipment — maintained and operated by experienced road crews for continuous production paving.",
    capabilityBodyTitle: "Road paving and drainage capability for national, district and industrial corridors.",
    capabilityBodyDesc: "Our road teams operate production paving equipment with GPS alignment, layer-by-layer compaction testing and drainage integration — maintaining quality control from earthwork to wearing surface.",
    faqTitle: "Questions about road and highway construction services.",
    faqLead: "Answers to what government road authorities, developers and industrial clients ask most often before engaging Zakir Enterprise for road construction.",
    scope: [
      {
        icon: "road",
        title: "Route Survey & Subgrade Preparation",
        body: "Alignment survey, clearing, subgrade stabilization and compaction to design bearing capacity.",
      },
      {
        icon: "earth",
        title: "Pavement Layer Construction",
        body: "Sub-base, aggregate base course and bituminous or concrete wearing surface layers with QA at each stage.",
      },
      {
        icon: "drain",
        title: "Roadside Drainage & Culverts",
        body: "Side drains, inlets, culverts and cross-drainage structures integrated within the road formation.",
      },
      {
        icon: "special",
        title: "Road Safety & Traffic Features",
        body: "Thermoplastic line marking, road studs, guardrails and traffic signage to RHD standards.",
      },
      {
        icon: "bridge",
        title: "Bridge Approaches & Transition Works",
        body: "Approach embankment, wing walls and pavement transition zones at bridge and culvert locations.",
      },
      {
        icon: "finish",
        title: "Final Inspection & Handover",
        body: "Ride quality check, visual inspection, defect close-out and documentation package for client handover.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Survey & Design Review",
        body: "Alignment verification, pavement design review and material source identification.",
      },
      {
        tag: "Phase 02",
        title: "Subgrade & Base Preparation",
        body: "Clearing, earthwork, subgrade stabilization and sub-base layer placement.",
      },
      {
        tag: "Phase 03",
        title: "Pavement Construction",
        body: "Base course and wearing surface layers placed with compaction control and QA testing.",
      },
      {
        tag: "Phase 04",
        title: "Drainage & Safety Features",
        body: "Drainage installation, culvert works, line marking and road safety infrastructure.",
      },
      {
        tag: "Phase 05",
        title: "Inspection & Handover",
        body: "Ride quality assessment, compliance checks and formal project handover with documentation.",
      },
    ],
    benefits: [
      {
        icon: "road",
        title: "Full Pavement Layer Expertise",
        body: "Experienced in all road layers from earthworks to bituminous surfacing under QA-controlled methods.",
      },
      {
        icon: "special",
        title: "Traffic-Safe Phasing",
        body: "Live-road phasing plans developed to maintain traffic flow while protecting site workers.",
      },
      {
        icon: "building",
        title: "QA-Led Material Control",
        body: "In-house and third-party material testing at key compaction, grading and bituminous stages.",
      },
      {
        icon: "drain",
        title: "Integrated Drainage Delivery",
        body: "Road drainage, culverts and cross-drainage handled within the main road package.",
      },
      {
        icon: "equip",
        title: "Dedicated Road Paving Fleet",
        body: "Asphalt pavers, rollers, graders and compactors available for continuous production paving.",
      },
      {
        icon: "renov",
        title: "RHD & PWD Compliance Familiarity",
        body: "Works delivered to standard road authority specifications with supporting test records and compliance packages.",
      },
    ],
    machine: [
      { t: "Motor Graders", d: "Precision grading for subgrade and base course shaping." },
      { t: "Asphalt Pavers & Finishers", d: "Continuous paving for bituminous surface layers with grade and slope control." },
      { t: "Compaction Rollers", d: "Static, vibratory and pneumatic rollers for all pavement layer compaction." },
      { t: "Bitumen Sprayers", d: "Prime coat, tack coat and chip seal application across road surfaces." },
      { t: "Concrete Mixers & Pavers", d: "For concrete road sections, aprons, and rigid pavement elements." },
      { t: "Surveying & QA Equipment", d: "Level instruments, GPS and compaction testing for alignment and layer compliance." },
    ],
    faq: [
      {
        q: "Does Zakir Enterprise handle both flexible and rigid pavement roads?",
        a: "Yes. We execute both bituminous flexible pavement and concrete rigid pavement roads depending on design specification and client requirement.",
      },
      {
        q: "How do you maintain traffic flow during road construction?",
        a: "We prepare a Traffic Management Plan before mobilization, phasing the work to maintain at least one carriageway open at all times with appropriate signage and flagging.",
      },
      {
        q: "Can you supply materials as part of the road contract?",
        a: "Yes. We manage material procurement — including aggregate, bitumen and concrete — sourced from verified suppliers and tested to specification before use.",
      },
      {
        q: "How do you control compaction quality on pavement layers?",
        a: "Each layer undergoes compaction testing (CBR, Proctor, nuclear density where specified) before the next layer is placed, with test records maintained throughout.",
      },
    ],
  },

  // ─── 3. Bridge, Culvert & Structural Engineering Works ─────────────────
  {
    slug: "bridge-culvert-and-structural-engineering-works",
    title: "Bridge, Culvert & Structural Engineering Works",
    icon: "bridge",
    serviceNo: 3,
    totalServices: 11,
    subtitle:
      "Bridge and culvert systems engineered for load performance, hydraulic resilience and long-term structural integrity.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306796/Bridge_-_Hero_hysfta.jpg",
    machineImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777265050/SKCD_updated_hero_1_ndt0oa.jpg",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Structural Engineering Works" },
      { k: "Execution Model", v: "Design-Build Support" },
      { k: "Load Standards", v: "Bangladesh Bridge Design Standard" },
      { k: "Delivery Reach", v: "Nationwide" },
    ],
    overview: {
      title:
        "Bridge and culvert works executed with structural rigour, load compliance and hydraulic performance at the centre.",
      lead:
        "Zakir Enterprise delivers bridge, culvert and structural engineering works through experienced structural teams — from foundation piling and substructure to deck construction, load testing and formal handover.",
      body: [
        "Each bridge or culvert scope is executed against approved structural drawings with QA hold-points at every critical stage — piling, concrete pours, formwork stripping and load testing — ensuring structural integrity is verified throughout construction, not only at completion.",
        "Our teams are experienced in working across waterways, on approach embankments and in restricted corridors — managing dewatering, formwork and concrete supply for the specific access and environmental conditions of each site.",
      ],
      bullets: [
        "Piling and deep foundation works for bridges",
        "Reinforced concrete substructure and superstructure",
        "Pre-cast and in-situ deck and girder systems",
        "Box and pipe culvert construction",
        "Load testing and structural inspection",
        "Approach roads and embankment protection",
      ],
    },
    scopeTitle: "Foundation to deck — bridge and culvert delivery with structural integrity verified at every stage.",
    scopeLead: "Structural bridge and culvert works require precision from piling and concrete quality through to load testing — each stage documented and accepted before the next begins.",
    processTitle: "Five sequential stages from structural review and piling to load testing and formal handover.",
    processLead: "Bridge and culvert construction progresses through a stage-by-stage sequence — each phase verified and documented before the next begins — ensuring structural integrity is built in throughout.",
    benefitsTitle: "Selected for structural precision, piling capability and load-verified bridge delivery.",
    benefitsLead: "Bridge clients choose Zakir Enterprise for our owned piling rigs, in-house load testing capability and thorough QA documentation on every structural element.",
    capabilityTitle: "Piling rigs, bridge formwork and structural lifting equipment for waterway works.",
    capabilityLead: "From bored pile rigs and batching plants to bridge cranes and dewatering systems — our structural fleet is sized for waterway, restricted-access and on-shore bridge conditions.",
    capabilityBodyTitle: "Structural execution capability from foundation piling to superstructure and deck.",
    capabilityBodyDesc: "Our bridge teams combine owned piling equipment, structural formwork, concrete QA and load test instruments — delivering verified, documented bridge and culvert structures from first pile to handover.",
    faqTitle: "Questions about bridge, culvert and structural engineering works.",
    faqLead: "Clear answers to what engineers, government clients and developers ask most often before engaging Zakir Enterprise for bridge and structural construction.",
    scope: [
      {
        icon: "foundation",
        title: "Foundation & Piling Works",
        body: "Bored pile, precast pile or raft foundations for bridge substructure, sized to geotechnical and load requirements.",
      },
      {
        icon: "building",
        title: "Substructure Construction",
        body: "Pile caps, abutments, piers and wing walls constructed to reinforced concrete drawings with tested materials.",
      },
      {
        icon: "concrete",
        title: "Superstructure & Deck Works",
        body: "In-situ or precast girder placement, deck slab, parapet and expansion joint installation.",
      },
      {
        icon: "drain",
        title: "Culvert & Cross-Drainage Structures",
        body: "Box culverts, pipe culverts and headwall systems for road drainage and waterway crossings.",
      },
      {
        icon: "special",
        title: "Load Testing & Inspection",
        body: "Structural load tests, crack surveys and compliance inspections before final acceptance.",
      },
      {
        icon: "road",
        title: "Approach Works & Protection",
        body: "Approach embankment, slope protection, revetment and road transition at bridge ends.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Structural Design Review",
        body: "Drawing review, geotechnical report check and method statement preparation.",
      },
      {
        tag: "Phase 02",
        title: "Foundation & Piling",
        body: "Pile installation with integrity testing and pile cap construction.",
      },
      {
        tag: "Phase 03",
        title: "Substructure Build",
        body: "Abutment, pier and wing wall construction with concrete QA and formwork control.",
      },
      {
        tag: "Phase 04",
        title: "Superstructure & Deck",
        body: "Girder erection or in-situ deck pour, parapet, surfacing and joint installation.",
      },
      {
        tag: "Phase 05",
        title: "Load Test & Handover",
        body: "Structural load test, snag resolution and formal documentation handover.",
      },
    ],
    benefits: [
      {
        icon: "building",
        title: "Load-Rated Structural Execution",
        body: "All structural works referenced to Bangladesh Bridge Design Standards with load-verified methods.",
      },
      {
        icon: "drain",
        title: "Hydraulic Design Awareness",
        body: "Culvert and bridge openings sized with consideration for flood hydrology and scour protection.",
      },
      {
        icon: "special",
        title: "Certified Concrete & Materials",
        body: "Cube tests, rebar certification and QA records maintained at every pour and structural element.",
      },
      {
        icon: "foundation",
        title: "Piling Capability On-Hand",
        body: "Bored pile rigs and precast pile handling equipment available without third-party dependency.",
      },
      {
        icon: "road",
        title: "Waterway & Restricted Access Experience",
        body: "Dewatering, river cofferdam and restricted-corridor bridge construction experience.",
      },
      {
        icon: "concrete",
        title: "Full Documentation Package",
        body: "Pile records, concrete registers, load test reports and as-built drawings delivered at handover.",
      },
    ],
    machine: [
      { t: "Piling Rigs", d: "Bored pile and precast pile rigs for bridge foundation works." },
      { t: "Formwork & Falsework Systems", d: "Modular and custom formwork for piers, abutments and deck slab construction." },
      { t: "Concrete Batching Plants", d: "Site-based batching for consistent, specification-compliant structural concrete." },
      { t: "Structural Lifting Cranes", d: "Crawler and mobile cranes for girder erection and precast element placement." },
      { t: "Dewatering Equipment", d: "Wellpoint and submersible systems for cofferdam and waterway management." },
      { t: "Load Testing & Inspection Tools", d: "Dial gauges, load cells and structural monitoring instruments for acceptance testing." },
    ],
    faq: [
      {
        q: "What bridge types can Zakir Enterprise construct?",
        a: "We construct RCC slab bridges, prestressed girder bridges, single-span and multi-span structures — and box and pipe culverts — depending on span length, loading and hydraulic requirements.",
      },
      {
        q: "How is structural concrete quality controlled on your bridge projects?",
        a: "We batch concrete on-site or from verified ready-mix plants, conduct cube tests at pour, and maintain a pour register with slump, strength and mix records for every structural element.",
      },
      {
        q: "Do you carry out load testing after bridge construction?",
        a: "Yes. Load tests are conducted per design specification before handover, with deflection and recovery readings recorded and submitted as part of the completion documentation.",
      },
      {
        q: "Can you work on bridges over active waterways?",
        a: "Yes. We have experience deploying cofferdams, dewatering systems and river-working methods for foundation construction in active waterway conditions.",
      },
    ],
  },

  // ─── 4. Large-Scale Earthwork & Land Development ────────────────────────
  {
    slug: "large-scale-earthwork-and-land-development",
    title: "Large-Scale Earthwork & Land Development",
    icon: "earth",
    serviceNo: 4,
    totalServices: 11,
    subtitle:
      "Bulk excavation, filling, grading and stabilization for industrial, urban and infrastructure-ready land transformation.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778306900/Earthwork-_Hero_b2iq6d.jpg",
    machineImage:
      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Earthwork & Land Development" },
      { k: "Execution Model", v: "Bulk Production Operations" },
      { k: "Volume Capacity", v: "100,000 m³ and above" },
      { k: "Delivery Reach", v: "Nationwide" },
    ],
    overview: {
      title:
        "Large-scale earthwork and land development executed with production-grade fleet, GPS-controlled grading and compaction compliance.",
      lead:
        "Zakir Enterprise transforms undeveloped, uneven or low-lying land into infrastructure-ready platforms through bulk earthwork operations — clearing, excavating, filling, grading and stabilizing at the volumes industrial and urban development demands.",
      body: [
        "Our earthwork teams operate at production scale, supported by owned heavy fleet — excavators, bulldozers, scrapers, dump trucks and compactors — with GPS-aided grade control ensuring volume accuracy and platform levels are achieved to design tolerances.",
        "Erosion control, drainage planning and compaction verification are embedded in every earthwork program, protecting completed platforms from settlement and water ingress before the next construction phase begins.",
      ],
      bullets: [
        "Site clearing, topsoil stripping and demolition removal",
        "Bulk excavation and material disposal or reuse",
        "Fill placement, spreading and compaction",
        "Precision grading to design finished levels",
        "Soil stabilization with lime, cement or geotextile",
        "Erosion protection and slope stabilization",
      ],
    },
    scopeTitle: "From site clearing to finished platform — bulk earthwork sequenced for production, compaction and drainage.",
    scopeLead: "Land development at scale demands systematic earthwork operations, layer-by-layer compaction verification and drainage planning from the first machine movement to final grade.",
    processTitle: "Five production phases from survey and clearing to compaction-verified final platform.",
    processLead: "Earthwork delivery follows a systematic production sequence — survey, clear, cut, fill, grade — with compaction testing at every lift and drainage embedded before the platform is handed over.",
    benefitsTitle: "Selected for bulk production capacity, GPS grading accuracy and compaction compliance.",
    benefitsLead: "Earthwork clients choose us for high daily output rates, machine-mounted GPS grade control and layer-by-layer compaction QA on large-scale industrial and infrastructure platforms.",
    capabilityTitle: "Large earthmoving fleet with GPS grade control for production-scale land development.",
    capabilityLead: "Excavators, bulldozers, graders, compaction rollers and dump trucks — maintained as a coordinated production fleet with GPS accuracy and compaction testing at every lift.",
    capabilityBodyTitle: "Production earthwork delivery for industrial, urban and infrastructure-ready platforms.",
    capabilityBodyDesc: "Our earthwork teams sustain high-output production with GPS-controlled grading and compaction QA — delivering accurate platforms on schedule regardless of site scale or ground conditions.",
    faqTitle: "Questions about large-scale earthwork and land development.",
    faqLead: "Practical answers to what industrial clients, developers and infrastructure owners ask before engaging Zakir Enterprise for large earthwork and platforming contracts.",
    scope: [
      {
        icon: "earth",
        title: "Site Clearing & Topsoil Strip",
        body: "Vegetation removal, topsoil stripping, demolition clearing and site preparation before bulk earthwork begins.",
      },
      {
        icon: "special",
        title: "Volume Calculation & Survey Control",
        body: "Pre- and post-work survey with GPS volume calculation to verify cut and fill quantities against design.",
      },
      {
        icon: "equip",
        title: "Bulk Excavation & Haulage",
        body: "High-production excavation with dump truck haulage to fill areas or disposal points as per earthwork plan.",
      },
      {
        icon: "foundation",
        title: "Fill Placement & Compaction",
        body: "Controlled fill placement in layers with roller compaction and density testing at each lift.",
      },
      {
        icon: "building",
        title: "Precision Grading & Platforming",
        body: "GPS and laser-controlled grading to final platform levels for construction, paving or drainage readiness.",
      },
      {
        icon: "drain",
        title: "Drainage & Erosion Control",
        body: "Temporary and permanent drainage channels, slope protection and erosion control measures on completed earthworks.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Topographic Survey",
        body: "Ground survey, volume calculation and earthwork balance review against design drawings.",
      },
      {
        tag: "Phase 02",
        title: "Clearing & Stripping",
        body: "Vegetation removal, topsoil strip and site access road establishment.",
      },
      {
        tag: "Phase 03",
        title: "Excavation & Haulage",
        body: "Bulk cut operations with truck haulage to fill or disposal areas per earthwork plan.",
      },
      {
        tag: "Phase 04",
        title: "Fill Placement & Compaction",
        body: "Layer-by-layer fill placement with compaction testing at each lift.",
      },
      {
        tag: "Phase 05",
        title: "Final Grade & Handover",
        body: "GPS-controlled final grading to design level, drainage installation and client sign-off.",
      },
    ],
    benefits: [
      {
        icon: "earth",
        title: "High-Volume Production Capacity",
        body: "Large owned earthmoving fleet capable of sustained high-output production on major earthwork packages.",
      },
      {
        icon: "building",
        title: "GPS-Aided Grade Control",
        body: "Machine-grade GPS on key earthmoving units for accurate cut and fill to design tolerance.",
      },
      {
        icon: "special",
        title: "Compaction QA at Every Lift",
        body: "Density and compaction tests conducted layer by layer, with records maintained for client and regulatory review.",
      },
      {
        icon: "drain",
        title: "Erosion & Drainage Awareness",
        body: "Permanent and temporary drainage planned from the start to protect completed earthwork platforms.",
      },
      {
        icon: "foundation",
        title: "Soil Stabilization Capability",
        body: "Lime, cement or geotextile stabilization for weak or problematic subgrade conditions.",
      },
      {
        icon: "road",
        title: "Flexible Phasing Plans",
        body: "Multi-phase earthwork programs designed around live operations, seasonal constraints or rolling construction zones.",
      },
    ],
    machine: [
      { t: "Large Hydraulic Excavators", d: "High-production excavation for bulk cut and foundation works." },
      { t: "Bulldozers & Scrapers", d: "Mass push-and-spread operations for large fill placement areas." },
      { t: "Motor Graders", d: "Precision finish grading for platform levels and road formation." },
      { t: "Compaction Rollers", d: "Vibratory and static rollers for layer-by-layer compaction control." },
      { t: "Articulated Dump Trucks", d: "High-capacity off-road haulage between cut and fill areas." },
      { t: "GPS Grade Control Systems", d: "Machine-mounted GPS for real-time grade accuracy during push and grading operations." },
    ],
    faq: [
      {
        q: "What volume of earthwork can Zakir Enterprise handle on a single project?",
        a: "We have completed projects exceeding 500,000 m³ and have the fleet capacity to sustain high daily production rates on large earthwork packages.",
      },
      {
        q: "How do you verify compaction quality after filling?",
        a: "Each compacted lift is tested using nuclear density gauge or sand replacement method to verify compliance with the specified compaction standard before the next layer is placed.",
      },
      {
        q: "Can you handle low-lying or waterlogged land development?",
        a: "Yes. We have experience with dewatering, controlled fill placement and geotextile reinforcement on problematic low-lying sites typical in Bangladesh.",
      },
      {
        q: "Do you calculate earthwork volumes before starting?",
        a: "Yes. We conduct a full topographic survey and earthwork volume calculation against the design before committing to a program, so cut-fill balance and haul distances are understood from day one.",
      },
    ],
  },

  // ─── 5. River Training, Dredging & Canal Development ───────────────────
  {
    slug: "river-training-dredging-and-canal-development",
    title: "River Training, Dredging & Canal Development",
    icon: "renov",
    serviceNo: 5,
    totalServices: 11,
    subtitle:
      "Hydraulic improvement and protection works for riverbanks, canals and waterways in erosion-prone and silted corridors.",
    heroImage:
      "https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1590590032559-8e03e7e2e9ef?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Hydraulic & Waterway Works" },
      { k: "Execution Model", v: "Wet & Dry Operations" },
      { k: "Compliance", v: "BWDB Standards" },
      { k: "Delivery Reach", v: "Riverine Bangladesh" },
    ],
    overview: {
      title:
        "River training, dredging and canal development works delivered with hydraulic engineering awareness and BWDB compliance.",
      lead:
        "Zakir Enterprise undertakes river training, dredging and canal development works along Bangladesh's riverine corridors — protecting banks from erosion, restoring channel capacity and improving drainage and navigation performance.",
      body: [
        "Our teams work with dredging equipment, geobag placement units and hydraulic excavators in wet and dry conditions — coordinating works around tidal and seasonal flood patterns to maximize productive work windows without compromising safety.",
        "Every river training or canal works assignment is referenced to BWDB design specifications and flood hydrology data, ensuring protection measures and channel profiles are set to long-term hydraulic performance standards.",
      ],
      bullets: [
        "Riverbank erosion protection with geobags and revetment",
        "Channel dredging for depth and flow restoration",
        "Canal excavation, re-profiling and lining",
        "Spur and guide bund construction",
        "Slope protection with rip-rap and stone pitching",
        "Post-works monitoring and survey",
      ],
    },
    scopeTitle: "Waterway works from hydrological assessment through bank protection to channel restoration.",
    scopeLead: "River training and canal works demand hydraulic awareness, seasonal work planning and the right equipment mix — from geobag revetment placement to mechanical dredging operations.",
    processTitle: "Five operational phases from hydrological assessment to channel works and post-handover survey.",
    processLead: "River and canal delivery follows a hydraulic-aware sequence — assess, plan, protect, dredge, inspect — with seasonal flood constraints and BWDB specifications embedded in every phase.",
    benefitsTitle: "Selected for riverine experience, geobag expertise and BWDB-compliant delivery.",
    benefitsLead: "Clients on Bangladesh's riverine corridors choose us for our dredging capability, seasonal work planning and track record delivering under BWDB design and specification standards.",
    capabilityTitle: "Dredging equipment, geobag units and hydraulic plant for river and canal works.",
    capabilityLead: "Mechanical dredgers, long-reach excavators, geobag placement units, survey boats and embankment equipment — deployed with flood-season awareness and waterway safety protocols.",
    capabilityBodyTitle: "Hydraulic and riverine execution for bank protection and channel restoration.",
    capabilityBodyDesc: "Our river works teams combine dredging plant, revetment equipment and hydrological knowledge — executing under BWDB specifications with post-works channel survey and monitoring included.",
    faqTitle: "Questions about river training, dredging and canal development.",
    faqLead: "Answers to what government clients, waterway engineers and BWDB project managers ask most often before engaging Zakir Enterprise for hydraulic and riverine works.",
    scope: [
      {
        icon: "renov",
        title: "Hydrological Review & Site Assessment",
        body: "Flood hydrology review, channel survey and erosion assessment before protection or dredging works begin.",
      },
      {
        icon: "earth",
        title: "Riverbank Protection Works",
        body: "Geobag placement, stone pitching, slope grading and rip-rap revetment for bank erosion control.",
      },
      {
        icon: "special",
        title: "Dredging & Silt Removal",
        body: "Mechanical dredging to restore channel depth and flow capacity in silted waterways.",
      },
      {
        icon: "drain",
        title: "Canal Excavation & Re-Profiling",
        body: "New canal excavation or existing canal widening, deepening and re-profiling to design cross-sections.",
      },
      {
        icon: "foundation",
        title: "Spur & Bund Construction",
        body: "River training spurs, guide bunds and embankment protection works for channel alignment control.",
      },
      {
        icon: "building",
        title: "Monitoring & Post-Works Survey",
        body: "Channel profile and bank condition survey after works to verify performance against design intent.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Hydrological Assessment",
        body: "Channel survey, flood level review and erosion condition mapping.",
      },
      {
        tag: "Phase 02",
        title: "Method & Equipment Planning",
        body: "Dredging or protection method selection, equipment mobilization and seasonal work window planning.",
      },
      {
        tag: "Phase 03",
        title: "Bank Protection Works",
        body: "Geobag placement, revetment, slope grading and spur construction as per design.",
      },
      {
        tag: "Phase 04",
        title: "Dredging & Canal Works",
        body: "Mechanical dredging, canal excavation and disposal of dredged material.",
      },
      {
        tag: "Phase 05",
        title: "Inspection & Handover",
        body: "Post-works survey, as-built documentation and client acceptance.",
      },
    ],
    benefits: [
      {
        icon: "renov",
        title: "Riverine Works Experience",
        body: "Experience working in Bangladesh's flood-prone and tidal riverine corridors under seasonal constraints.",
      },
      {
        icon: "special",
        title: "Geobag & Revetment Expertise",
        body: "Skilled placement teams for geobag, stone pitching and rip-rap slope protection works.",
      },
      {
        icon: "earth",
        title: "Dredging Fleet Available",
        body: "Mechanical dredging units and hydraulic excavators for channel deepening and silt removal.",
      },
      {
        icon: "building",
        title: "BWDB Compliance Readiness",
        body: "Works referenced to Bangladesh Water Development Board design and specification standards.",
      },
      {
        icon: "drain",
        title: "Seasonal Work Window Planning",
        body: "Operations planned around flood seasons to maximize safe productive access to waterway sites.",
      },
      {
        icon: "foundation",
        title: "Environmental Sensitivity Awareness",
        body: "Dredge spoil management and bank works conducted with attention to aquatic and riparian environments.",
      },
    ],
    machine: [
      { t: "Mechanical Dredgers", d: "Bucket or clamshell dredging units for silt and sediment removal from channels." },
      { t: "Hydraulic Excavators (Long Reach)", d: "Extended-reach excavators for bank works and canal excavation from shore." },
      { t: "Geobag Placement Units", d: "Barge-mounted or shore-based geobag filling and placement equipment." },
      { t: "Stone & Rip-Rap Placement Equipment", d: "Cranes and dumpers for slope protection stone and rip-rap placement." },
      { t: "Survey Boats & Echo Sounders", d: "Channel depth survey and bank profile monitoring vessels." },
      { t: "Compaction & Embankment Equipment", d: "Rollers and dozers for bund and embankment construction above waterline." },
    ],
    faq: [
      {
        q: "What river training methods does Zakir Enterprise use for bank protection?",
        a: "We use geobag placement, stone pitching, rip-rap revetment and concrete block protection — the method selected based on hydraulic loading, available materials and BWDB specification.",
      },
      {
        q: "How do you manage dredging during flood seasons?",
        a: "We plan work windows around seasonal flood patterns, mobilizing during dry and recession seasons and suspending works when river levels or currents create unsafe conditions.",
      },
      {
        q: "Can you execute both river training and canal works in the same contract?",
        a: "Yes. We have the equipment and team capability to handle river bank protection, dredging, canal excavation and drainage improvement within a single integrated contract.",
      },
      {
        q: "How is dredged material disposed of?",
        a: "Dredged material is either reused as fill in designated areas or disposed at approved disposal sites, with the plan agreed with the client and engineer before works begin.",
      },
    ],
  },

  // ─── 6. Heavy Equipment Supply, Rental & Operation ──────────────────────
  {
    slug: "heavy-equipment-supply-rental-and-operation",
    title: "Heavy Equipment Supply, Rental & Operation",
    icon: "special",
    serviceNo: 6,
    totalServices: 11,
    subtitle:
      "Reliable heavy machinery access with trained operators, maintenance assurance and deployment planning for active sites.",
    heroImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1590644875981-3b4dbbd8b8ac?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Equipment Hire & Operations" },
      { k: "Execution Model", v: "Supply, Operate & Maintain" },
      { k: "Fleet Size", v: "100+ Owned Units" },
      { k: "Delivery Reach", v: "Nationwide Deployment" },
    ],
    overview: {
      title:
        "Heavy equipment supplied with trained operators, preventive maintenance and deployment coordination across Bangladesh.",
      lead:
        "Zakir Enterprise provides heavy equipment hire and operated plant services from an owned fleet of over 100 units — covering excavators, cranes, compactors, graders, concrete units and specialist machinery for active construction sites.",
      body: [
        "Every equipment deployment is matched to the site's specific task requirements — with operator briefing, daily maintenance checks and fuel and logistics support arranged before the machine reaches site — so clients avoid the downtime and coordination delays that come with poorly-managed equipment hire.",
        "Whether the requirement is a single excavator for a week or a coordinated fleet deployment for a long-running infrastructure package, we manage the allocation, operation and maintenance as one service — with transparent rates and performance reporting.",
      ],
      bullets: [
        "Excavators, bulldozers, graders and compactors",
        "Cranes, lifting rigs and material handlers",
        "Concrete production and placement units",
        "Specialist access and demolition machinery",
        "Trained and certified operators included",
        "Preventive maintenance and breakdown response",
      ],
    },
    scopeTitle: "End-to-end plant service from needs assessment and fleet dispatch to on-site operation and reporting.",
    scopeLead: "Reliable equipment access goes beyond machine availability — it requires matched fleet selection, trained operators, maintained plant and coordinated logistics from mobilization to return.",
    processTitle: "Five managed stages from site requirement review to operated deployment and sign-off.",
    processLead: "Equipment hire with Zakir Enterprise follows a structured service process — needs assessment, fleet allocation, operator briefing, active site deployment and transparent performance review.",
    benefitsTitle: "Selected for fleet depth, trained operators and managed plant deployment.",
    benefitsLead: "Equipment clients choose us because we own our fleet, provide trained operators and manage all maintenance — delivering productive plant on-site without third-party reliability risk.",
    capabilityTitle: "100+ owned units available for immediate nationwide deployment with operators.",
    capabilityLead: "From excavators and cranes to concrete units and specialist access machines — our maintained, insured fleet is ready to deploy with trained operators to any district in Bangladesh.",
    capabilityBodyTitle: "Managed plant hire service with operators, maintenance and logistics included.",
    capabilityBodyDesc: "We deploy heavy equipment as a complete managed service — operator assigned, daily maintenance scheduled, fuel and logistics coordinated — so clients receive productive, safe plant from day one on-site.",
    faqTitle: "Questions about heavy equipment supply, rental and operation.",
    faqLead: "Practical answers to what construction managers, project directors and site supervisors ask most often before engaging Zakir Enterprise for operated plant hire.",
    scope: [
      {
        icon: "special",
        title: "Equipment Needs Assessment",
        body: "Site requirement review, task type mapping and fleet selection for optimal production and cost efficiency.",
      },
      {
        icon: "equip",
        title: "Fleet Selection & Dispatch",
        body: "Machine allocation from owned fleet, transport logistics and delivery to site within agreed timeframe.",
      },
      {
        icon: "building",
        title: "Operator Deployment & Briefing",
        body: "Trained operators dispatched with site-specific briefing on task requirements, safety and reporting.",
      },
      {
        icon: "foundation",
        title: "On-Site Maintenance Support",
        body: "Daily pre-shift checks, scheduled maintenance and breakdown response to minimize production downtime.",
      },
      {
        icon: "road",
        title: "Fuel & Logistics Coordination",
        body: "Fuel supply, transport of spare parts and logistics support coordinated with site schedule.",
      },
      {
        icon: "drain",
        title: "Performance Monitoring & Reporting",
        body: "Daily output records, utilization tracking and performance reporting for client visibility and billing accuracy.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Requirement Review",
        body: "Site visit or brief review, task analysis and fleet selection recommendation.",
      },
      {
        tag: "Phase 02",
        title: "Equipment Allocation",
        body: "Machine assignment from fleet, preparation, maintenance check and transport planning.",
      },
      {
        tag: "Phase 03",
        title: "Operator Briefing",
        body: "Operator assignment, site safety induction and task briefing before deployment.",
      },
      {
        tag: "Phase 04",
        title: "Active Site Deployment",
        body: "Operated plant on-site with daily maintenance, fuel and performance monitoring.",
      },
      {
        tag: "Phase 05",
        title: "Performance Review & Return",
        body: "Output review, billing reconciliation, machine demobilization and site clearance.",
      },
    ],
    benefits: [
      {
        icon: "special",
        title: "100+ Owned Units Available",
        body: "Large owned fleet covering all major heavy construction equipment types without sub-hire dependency.",
      },
      {
        icon: "equip",
        title: "Trained & Certified Operators",
        body: "Experienced machine operators with task-specific competency and active safety certification.",
      },
      {
        icon: "building",
        title: "Preventive Maintenance Schedule",
        body: "Scheduled servicing and daily inspection protocols reduce breakdown risk and maximize utilization.",
      },
      {
        icon: "road",
        title: "Rapid Deployment Capability",
        body: "Equipment mobilized and on-site within 24–72 hours for urgent project requirements.",
      },
      {
        icon: "foundation",
        title: "Site-Specific Equipment Matching",
        body: "Machine type, size and attachment selected to match actual site tasks — not generic availability.",
      },
      {
        icon: "drain",
        title: "Transparent Hire Rates",
        body: "Clear day-rate and shift-rate structures with output-based reporting for accurate client billing.",
      },
    ],
    machine: [
      { t: "Excavators & Backhoes", d: "5t to 50t excavators for digging, trenching, loading and demolition tasks." },
      { t: "Wheel Loaders & Dump Trucks", d: "Material loading, haulage and aggregate handling on active sites." },
      { t: "Cranes & Lifting Rigs", d: "Mobile and crawler cranes for structural lifting and material handling." },
      { t: "Motor Graders & Compactors", d: "Grading and compaction units for road, earthwork and platform applications." },
      { t: "Concrete Mixers & Pumps", d: "Ready-mix transit mixers and concrete pumps for in-situ pour operations." },
      { t: "Specialist Access Equipment", d: "Man-lifts, telescopic handlers and demolition attachments for restricted or elevated tasks." },
    ],
    faq: [
      {
        q: "Does Zakir Enterprise supply operators with the equipment?",
        a: "Yes. All hired equipment comes with trained and site-briefed operators as standard — clients do not need to source their own operators for our plant.",
      },
      {
        q: "What is the minimum hire period for heavy equipment?",
        a: "Minimum hire is typically one week, though we assess each requirement individually — urgent short-duration needs can be accommodated where fleet availability allows.",
      },
      {
        q: "How do you handle equipment breakdowns during hire?",
        a: "We carry spare parts for our common fleet and have a workshop and technical response team. In case of breakdown, we target a repair or replacement within 24 hours to minimize site disruption.",
      },
      {
        q: "Can you supply equipment to remote or difficult-access sites?",
        a: "Yes. We plan transport logistics for each deployment, including low-loaders, route surveys for over-dimension loads and site access assessment before dispatch.",
      },
    ],
  },

  // ─── 7. Drainage, Sewer & Water Infrastructure Systems ─────────────────
  {
    slug: "drainage-sewer-and-water-infrastructure-systems",
    title: "Drainage, Sewer & Water Infrastructure Systems",
    icon: "drain",
    serviceNo: 7,
    totalServices: 11,
    subtitle:
      "Underground and surface water management networks designed for reliability, compliance and urban flood mitigation.",
    heroImage:
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1778307032/Piling-Hero_bqxeu8.jpg",
    machineImage:
      "https://images.unsplash.com/photo-1545622783-b3e021430fee?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Water & Drainage Infrastructure" },
      { k: "Execution Model", v: "Underground & Surface Systems" },
      { k: "Compliance", v: "WASA / DPHE Standards" },
      { k: "Delivery Reach", v: "Urban & Rural Nationwide" },
    ],
    overview: {
      title:
        "Drainage, sewer and water infrastructure delivered with system-level thinking, compliance assurance and thorough testing.",
      lead:
        "Zakir Enterprise constructs drainage, sewer and water infrastructure systems for urban, industrial and institutional clients — covering underground pipe networks, open channel systems, manholes, pumping stations and water supply lines.",
      body: [
        "Our underground works teams manage the full installation sequence — trench excavation, bedding preparation, pipe laying, joint inspection, manhole construction, testing and backfill — with safety-controlled trench management and WASA or DPHE compliance at every step.",
        "Surface drainage systems, stormwater channels and flood mitigation networks are integrated alongside underground infrastructure to provide complete catchment-level water management solutions for both new developments and rehabilitation projects.",
      ],
      bullets: [
        "Underground pipe network installation and jointing",
        "Manhole, inspection chamber and inlet construction",
        "Open channel and surface drainage systems",
        "Sewer rising main and pumping station works",
        "Water supply distribution network installation",
        "Pressure testing, CCTV inspection and commissioning",
      ],
    },
    scopeTitle: "Underground and surface drainage installed, tested and reinstated to compliance standard.",
    scopeLead: "Water infrastructure delivery covers the full sequence — survey to trench to test to reinstatement — with safe excavation controls and WASA/DPHE compliance maintained throughout.",
    processTitle: "Five sequential stages from network survey to pipe installation, testing and reinstatement.",
    processLead: "Underground drainage delivery follows a strict sequence — survey, excavate, install, test, reinstate — with trench safety controls and WASA compliance maintained at every step.",
    benefitsTitle: "Selected for underground expertise, safe trench management and WASA compliance.",
    benefitsLead: "Drainage clients choose us for our pipe laying experience, safe excavation management and record of delivering to WASA, DPHE and government drainage specifications.",
    capabilityTitle: "Trenching machines, pipe handling equipment and CCTV inspection systems.",
    capabilityLead: "From high-production trenching units and dewatering pumps to pipe tongs, compaction rammers and CCTV inspection cameras — our drainage fleet is matched to urban and rural underground works.",
    capabilityBodyTitle: "Underground installation capability for drainage, sewer and water supply networks.",
    capabilityBodyDesc: "Our drainage teams manage the full installation sequence — trench to pipe to test to reinstatement — with safe excavation procedures, compliance documentation and CCTV inspection before backfill.",
    faqTitle: "Questions about drainage, sewer and water infrastructure systems.",
    faqLead: "Clear answers to what municipalities, developers and government clients ask most often before engaging Zakir Enterprise for underground drainage and water works.",
    scope: [
      {
        icon: "drain",
        title: "Network Layout & Trench Excavation",
        body: "Pipe route survey, trench excavation to design depth with safe shoring and dewatering as required.",
      },
      {
        icon: "foundation",
        title: "Pipe Laying & Jointing",
        body: "Concrete, PVC, HDPE and ductile iron pipe laying with joint inspection and bedding to specification.",
      },
      {
        icon: "building",
        title: "Manhole & Chamber Construction",
        body: "Precast or in-situ manhole, inspection chamber, inlet and junction box construction at design locations.",
      },
      {
        icon: "earth",
        title: "Surface Drainage Channels",
        body: "Open channel, box drain and roadside drain construction for surface runoff collection and conveyance.",
      },
      {
        icon: "special",
        title: "Testing & CCTV Inspection",
        body: "Hydrostatic pressure testing, leakage testing and CCTV camera inspection of installed pipelines.",
      },
      {
        icon: "road",
        title: "Backfill, Compaction & Reinstatement",
        body: "Controlled backfill in layers, compaction testing and surface reinstatement of roads or pavements disturbed.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Network Survey & Design Review",
        body: "Pipe route confirmation, invert levels, slope checks and material specification review.",
      },
      {
        tag: "Phase 02",
        title: "Excavation & Preparation",
        body: "Trench excavation, shoring, dewatering and pipe bedding preparation.",
      },
      {
        tag: "Phase 03",
        title: "Pipe Laying & Structure Build",
        body: "Pipe installation, jointing, manhole construction and utility crossings.",
      },
      {
        tag: "Phase 04",
        title: "Testing & Inspection",
        body: "Pressure test, CCTV inspection, leak check and system performance verification.",
      },
      {
        tag: "Phase 05",
        title: "Backfill & Reinstatement",
        body: "Layer backfill with compaction testing and full surface reinstatement.",
      },
    ],
    benefits: [
      {
        icon: "drain",
        title: "Underground Works Specialists",
        body: "Experienced pipe laying and manhole teams with safe trench management on urban and rural sites.",
      },
      {
        icon: "building",
        title: "WASA & DPHE Compliance",
        body: "Works delivered to national water and sewerage authority specifications with full test records.",
      },
      {
        icon: "special",
        title: "Multi-Pipe Material Capability",
        body: "Concrete, RCP, PVC, HDPE, DI and GRP pipe installation — material matched to service and loading.",
      },
      {
        icon: "foundation",
        title: "Flood Mitigation Design Awareness",
        body: "Drainage systems sized for catchment hydrology and flood-level compliance requirements.",
      },
      {
        icon: "road",
        title: "Safe Trench Management",
        body: "Trench shoring, edge protection and permit-to-enter systems for confined space safety.",
      },
      {
        icon: "earth",
        title: "Testing Before Backfill",
        body: "All pipelines tested and inspected before trench reinstatement so defects are caught early.",
      },
    ],
    machine: [
      { t: "Trenching Machines & Chain Excavators", d: "High-production trenching for drainage and utility pipeline routes." },
      { t: "Pipe Handling & Laying Equipment", d: "Side-boom tractors and pipe tongs for safe large-diameter pipe installation." },
      { t: "Dewatering Pumps", d: "Wellpoint and submersible systems for trench and excavation dewatering." },
      { t: "Compaction Rammers & Plates", d: "Trench compaction equipment for backfill layer density compliance." },
      { t: "CCTV Inspection Systems", d: "Push-rod and crawler CCTV cameras for internal pipeline inspection." },
      { t: "Concrete & Masonry Units", d: "Mixers, vibrators and formwork for in-situ manhole and chamber construction." },
    ],
    faq: [
      {
        q: "What pipe materials does Zakir Enterprise install for drainage and sewer works?",
        a: "We install RCP, PVC, HDPE, ductile iron, GRP and concrete pipes — the material selected based on service type, loading, chemical exposure and client specification.",
      },
      {
        q: "How do you ensure sewer pipes are properly laid to gradient?",
        a: "We use laser levelling and invert level checks at each pipe length and manhole to verify gradient compliance against design before backfilling.",
      },
      {
        q: "Can you work on urban sites with live traffic and utilities present?",
        a: "Yes. We prepare Traffic Management Plans and utility avoidance schemes for urban underground works, with service scanning before trench excavation begins.",
      },
      {
        q: "What testing is carried out on drainage and sewer pipelines before handover?",
        a: "We conduct hydrostatic or air pressure leakage tests and CCTV internal inspection — results are documented and submitted as part of the handover package.",
      },
    ],
  },

  // ─── 8. Piling, RCC & Structural Construction ───────────────────────────
  {
    slug: "piling-rcc-and-structural-construction",
    title: "Piling, RCC & Structural Construction",
    icon: "concrete",
    serviceNo: 8,
    totalServices: 11,
    subtitle:
      "Foundation and reinforced structural systems executed with strict QA/QC, testing protocols and precision methods.",
    heroImage:
      "https://images.unsplash.com/photo-1565008576549-57569a49371c?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1518335935020-cfd6580c1ab4?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Foundation & Structural Works" },
      { k: "Execution Model", v: "Method Statement Driven" },
      { k: "Pile Types", v: "Bored, CFA, Precast" },
      { k: "Delivery Reach", v: "Nationwide" },
    ],
    overview: {
      title:
        "Piling, RCC and structural construction executed with proven methods, load testing and QA-documented concrete at every pour.",
      lead:
        "Zakir Enterprise delivers deep foundation piling, reinforced concrete frame construction and structural works for commercial, industrial and infrastructure clients — with strict QA/QC from geotechnical review through to structural load testing.",
      body: [
        "Our piling teams operate bored pile and precast pile rigs with on-site concrete batching for quality-controlled pours — and carry out integrity testing and static or dynamic load testing before the structure above is built.",
        "Above foundation, our structural teams execute RCC frames, slabs, columns, beams and retaining walls to approved engineering drawings with cube testing, rebar traceability and formwork quality controls embedded in the production process.",
      ],
      bullets: [
        "Bored pile and CFA pile installation",
        "Precast concrete pile driving and handling",
        "Pile integrity testing and load testing",
        "Reinforced concrete foundations and pile caps",
        "RCC columns, beams, slabs and core walls",
        "Retaining walls and below-grade structural works",
      ],
    },
    scopeTitle: "Geotechnical review to load-tested piles and QA-documented structural frame under one delivery team.",
    scopeLead: "Foundation and structural works demand method-driven execution — controlled concrete quality, verified load capacity and rebar traceability from the first pile to the final structural pour.",
    processTitle: "Five method-driven stages from geotechnical review to load-tested piles and structural frame.",
    processLead: "Foundation and structural delivery moves through a verified sequence — soil review, pile design, piling, foundation, structural frame — with QA documentation at every load-bearing element.",
    benefitsTitle: "Selected for piling capability, load test execution and QA-documented structural works.",
    benefitsLead: "Structural clients choose Zakir Enterprise for our owned piling rigs, in-house load testing and disciplined concrete quality controls on both foundation and RCC frame works.",
    capabilityTitle: "Bored pile rigs, batching plants and load test instruments for structural works.",
    capabilityLead: "From hydraulic pile rigs and on-site concrete batching to PIT testers and static load test systems — our structural fleet supports verified, QA-documented foundation and frame delivery.",
    capabilityBodyTitle: "Foundation to structural frame capability under one accountable team.",
    capabilityBodyDesc: "Our piling and structural teams combine owned rigs, on-site batching and QA instruments — executing with rebar traceability, pour records and load test documentation from first pile to final structural element.",
    faqTitle: "Questions about piling, RCC and structural construction.",
    faqLead: "Answers to what structural engineers, developers and contractors ask most often before engaging Zakir Enterprise for foundation and structural works.",
    scope: [
      {
        icon: "foundation",
        title: "Geotechnical Review & Pile Design Coordination",
        body: "Soil investigation report review, pile type selection and design coordination with structural engineer.",
      },
      {
        icon: "concrete",
        title: "Piling Execution & Concrete Works",
        body: "Bored, CFA or precast pile installation with on-site concrete batching, cage assembly and tremie pour.",
      },
      {
        icon: "special",
        title: "Integrity & Load Testing",
        body: "PIT integrity testing, static load tests and dynamic load tests with full result documentation.",
      },
      {
        icon: "building",
        title: "Pile Cap & Raft Foundation",
        body: "Pile cap, ground beam and raft slab construction with reinforcement inspection and concrete QA.",
      },
      {
        icon: "earth",
        title: "RCC Structural Frame Works",
        body: "Column, beam, slab and core wall construction with formwork, rebar and concrete controls at each stage.",
      },
      {
        icon: "road",
        title: "QA Documentation & Handover",
        body: "Pour records, cube results, rebar certificates, test reports and as-built foundation drawings at completion.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Soil Investigation Review",
        body: "Geotechnical report interpretation, pile type selection and method statement preparation.",
      },
      {
        tag: "Phase 02",
        title: "Pile Design Coordination",
        body: "Structural drawing review, pile layout setting out and concrete mix design approval.",
      },
      {
        tag: "Phase 03",
        title: "Piling Execution",
        body: "Pile installation with concrete pour, cage inspection and integrity test protocols.",
      },
      {
        tag: "Phase 04",
        title: "Foundation Construction",
        body: "Pile cap, raft or ground beam construction with full rebar and concrete QA.",
      },
      {
        tag: "Phase 05",
        title: "Structural Handover",
        body: "Load test results, foundation records, cube tests and as-built documentation package.",
      },
    ],
    benefits: [
      {
        icon: "concrete",
        title: "Multiple Pile Types Available",
        body: "Bored pile, CFA and precast pile installation capability from owned rig fleet without sub-hire.",
      },
      {
        icon: "foundation",
        title: "Load Test Capability",
        body: "Static, dynamic and integrity testing conducted in-house with full certified result documentation.",
      },
      {
        icon: "special",
        title: "Strict QA/QC Protocol",
        body: "Stage-gate quality checkpoints for reinforcement, concrete, formwork and structural alignment.",
      },
      {
        icon: "building",
        title: "Structural RCC Expertise",
        body: "Experienced RCC frame teams with proven delivery on multi-storey and industrial structural packages.",
      },
      {
        icon: "equip",
        title: "On-Site Concrete Batching",
        body: "Site-based batching plants for specification-controlled concrete without ready-mix dependency.",
      },
      {
        icon: "earth",
        title: "Rebar Traceability",
        body: "Mill certificates, rebar inspection and bending records maintained for full traceability at handover.",
      },
    ],
    machine: [
      { t: "Bored Pile Rigs", d: "Hydraulic rotary drilling rigs for large-diameter bored pile installation." },
      { t: "CFA Pile Rigs", d: "Continuous flight auger rigs for vibration-sensitive or fast-paced piling works." },
      { t: "Precast Pile Hammers & Leaders", d: "Drop hammer and hydraulic hammer systems for precast concrete pile driving." },
      { t: "Concrete Batching Plants", d: "On-site batching for specification-controlled structural concrete pours." },
      { t: "Pile Integrity & Load Test Equipment", d: "PIT instruments, static load test kentledge and dynamic HSDPT systems." },
      { t: "Reinforcement Fabrication Tools", d: "Rebar bending, cutting and cage assembly equipment for on-site fabrication." },
    ],
    faq: [
      {
        q: "What pile types can Zakir Enterprise install?",
        a: "We install bored piles, CFA piles and precast concrete driven piles — type selection based on soil conditions, structural loads, site access and vibration sensitivity.",
      },
      {
        q: "How is concrete quality controlled during pile construction?",
        a: "We batch concrete on-site, conduct slump tests at every pour, take cube samples at regular intervals and maintain a complete pour register throughout piling works.",
      },
      {
        q: "Is load testing included in your piling service?",
        a: "Yes. We carry out PIT integrity testing as standard on all bored piles, with static load tests on working or sacrificial test piles as specified by the structural engineer.",
      },
      {
        q: "Can you handle both the piling and the RCC structural frame above foundation?",
        a: "Yes. We offer an integrated service from piling through pile caps, ground beams and RCC structural frame — reducing interface risk and keeping one team accountable throughout.",
      },
    ],
  },

  // ─── 9. Industrial & Environmental Engineering Projects (ETP, Utilities) ─
  {
    slug: "industrial-and-environmental-engineering-projects-etp-utilities",
    title: "Industrial & Environmental Engineering Projects (ETP, Utilities)",
    icon: "foundation",
    serviceNo: 9,
    totalServices: 11,
    subtitle:
      "Industrial utility and treatment infrastructure delivered with process-safety alignment and regulatory readiness.",
    heroImage:
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Industrial & Environmental Engineering" },
      { k: "Execution Model", v: "Civil + Mechanical + Process" },
      { k: "Compliance", v: "DoE / ECA / Industry Standards" },
      { k: "Delivery Reach", v: "Industrial Zones Nationwide" },
    ],
    overview: {
      title:
        "Industrial and environmental engineering projects delivered with process-safety discipline and environmental compliance readiness.",
      lead:
        "Zakir Enterprise constructs effluent treatment plants, water treatment facilities, utility infrastructure and industrial service systems — integrating civil construction, mechanical installation and process commissioning under a single delivery framework.",
      body: [
        "Our teams execute the civil and structural works for ETP, WTP and utility packages — foundations, tank construction, equipment plinths, pipe support structures and access platforms — coordinated with mechanical and process system installation to a commissioning-ready standard.",
        "Environmental compliance documentation, DoE submission support and operator handover training are included in our ETP delivery scope, ensuring clients are regulatory-ready from the day handover is completed.",
      ],
      bullets: [
        "Civil and structural works for ETP and WTP facilities",
        "Effluent and process tank construction",
        "Mechanical equipment foundations and installation support",
        "Utility piping, valve and instrument installation",
        "Electrical and control system rough-in works",
        "Process commissioning support and DoE readiness",
      ],
    },
    scopeTitle: "Civil, mechanical and utility works integrated for a commission-ready industrial facility.",
    scopeLead: "Industrial facility delivery requires coordination across civil structures, process equipment installation and utility systems — each phase completed ready for the next without interface gaps.",
    processTitle: "Five coordinated stages from requirements review to civil works, installation and commissioning.",
    processLead: "Industrial project delivery moves through a structured sequence — process review, design coordination, civil works, equipment installation, commissioning — each phase handed over ready for the next.",
    benefitsTitle: "Selected for ETP civil expertise, multi-discipline integration and DoE compliance awareness.",
    benefitsLead: "Industrial and ETP clients choose Zakir Enterprise for our treatment plant construction experience, multi-discipline delivery capability and understanding of DoE regulatory requirements.",
    capabilityTitle: "Civil, mechanical and process installation equipment for industrial facility delivery.",
    capabilityLead: "From formwork and concrete for ETP tanks to mechanical installation tools, process piping equipment and commissioning instruments — we cover the full industrial works scope in-house.",
    capabilityBodyTitle: "Integrated civil and mechanical execution for commission-ready facilities.",
    capabilityBodyDesc: "Our industrial teams execute civil structures, equipment installation and utility systems under one coordinated delivery — with commissioning support and compliance documentation included at no additional interface cost.",
    faqTitle: "Questions about industrial and environmental engineering projects.",
    faqLead: "Answers to what industrial clients, plant engineers and environmental consultants ask most often before engaging Zakir Enterprise for ETP construction and utility works.",
    scope: [
      {
        icon: "foundation",
        title: "Process Design Review & Civil Planning",
        body: "Process flow review, civil scope definition and coordination with process engineer for ETP or utility layout.",
      },
      {
        icon: "building",
        title: "Civil & Structural Construction",
        body: "Foundations, treatment tanks, equipment bases, pipe trenches and access structures for industrial facilities.",
      },
      {
        icon: "special",
        title: "Mechanical Equipment Installation",
        body: "Pump, blower, screen, clarifier and treatment equipment installation coordinated with civil completion.",
      },
      {
        icon: "drain",
        title: "Utility Piping & Service Systems",
        body: "Process piping, effluent channels, compressed air, cooling water and utility services installation.",
      },
      {
        icon: "equip",
        title: "Commissioning Support",
        body: "Pre-commissioning checks, system flushing, performance testing and process startup support.",
      },
      {
        icon: "earth",
        title: "Environmental Compliance Documentation",
        body: "DoE compliance package preparation, effluent monitoring setup and regulatory readiness verification.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Requirements & Process Review",
        body: "Process flow confirmation, civil scope definition and regulatory requirement mapping.",
      },
      {
        tag: "Phase 02",
        title: "Engineering & Design Coordination",
        body: "Drawing review, equipment specification check and construction method preparation.",
      },
      {
        tag: "Phase 03",
        title: "Civil Construction",
        body: "Foundation, tank, structure and utility trench works with QA and safety controls.",
      },
      {
        tag: "Phase 04",
        title: "Equipment Installation",
        body: "Mechanical, piping and electrical equipment installed to process drawings and commissioning specs.",
      },
      {
        tag: "Phase 05",
        title: "Commissioning & Handover",
        body: "System flushing, performance testing, regulatory documentation and client operations handover.",
      },
    ],
    benefits: [
      {
        icon: "foundation",
        title: "ETP & WTP Civil Expertise",
        body: "Extensive experience in treatment plant civil construction including RC tanks, channels and process structures.",
      },
      {
        icon: "special",
        title: "DoE Compliance Awareness",
        body: "Familiar with Bangladesh Department of Environment ECA requirements for industrial effluent treatment.",
      },
      {
        icon: "building",
        title: "Multi-Discipline Delivery",
        body: "Civil, structural, mechanical and utility services integrated under one accountable delivery team.",
      },
      {
        icon: "equip",
        title: "Industrial Safety Standards",
        body: "Process safety, chemical handling and confined space procedures applied on industrial facility sites.",
      },
      {
        icon: "drain",
        title: "Commissioning Support Included",
        body: "We remain on-site through startup and initial performance testing — not just construction handover.",
      },
      {
        icon: "earth",
        title: "Utility Integration Capability",
        body: "Compressed air, cooling water, raw water supply and effluent discharge systems coordinated in-scope.",
      },
    ],
    machine: [
      { t: "ETP Civil Construction Units", d: "Formwork, concrete and RC tank construction equipment for treatment structures." },
      { t: "Mechanical Installation Tools", d: "Chain hoists, gantry cranes and alignment tools for process equipment installation." },
      { t: "Pipe & Valve Installation Systems", d: "Pipe threading, fusion welding and flanging tools for process piping." },
      { t: "Electrical Rough-In Equipment", d: "Conduit and cable tray installation tools for control and power systems." },
      { t: "Process Testing Equipment", d: "Flow meters, pressure gauges and water quality instruments for commissioning." },
      { t: "Environmental Monitoring Tools", d: "Effluent sampling, pH, COD and BOD monitoring instruments for compliance." },
    ],
    faq: [
      {
        q: "Does Zakir Enterprise construct full ETP facilities or only civil works?",
        a: "We provide the full package — civil structures, mechanical equipment installation, utility piping and commissioning support — coordinated under one delivery team to minimize interface gaps.",
      },
      {
        q: "How do you ensure an ETP meets DoE compliance requirements?",
        a: "We work with the process engineer to ensure the treatment design meets ECA discharge standards, and prepare the civil and mechanical package to a standard that supports the DoE clearance process.",
      },
      {
        q: "Can you handle ETPs for textile, pharmaceutical and food processing industries?",
        a: "Yes. We have experience across multiple industrial sectors with varying effluent characteristics — each scope is reviewed against the specific process requirements before design and construction.",
      },
      {
        q: "What happens if the ETP does not meet performance targets after commissioning?",
        a: "We remain engaged through the initial operating period to identify and rectify any performance shortfalls — ensuring the system meets design targets before final handover is accepted.",
      },
    ],
  },

  // ─── 10. Finishing Work & End Engineering Design ─────────────────────────
  {
    slug: "finishing-work-and-end-engineering-design",
    title: "Finishing work and End Engineering Design ",
    icon: "finish",
    serviceNo: 10,
    totalServices: 11,
    subtitle:
      "Integrated engineering management from concept and planning to contractor coordination, control and delivery closeout.",
    heroImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Engineering Design & Finishing" },
      { k: "Execution Model", v: "Design Coordination to Completion" },
      { k: "Design Standards", v: "BNBC Compliant" },
      { k: "Delivery Reach", v: "Nationwide" },
    ],
    overview: {
      title:
        "Finishing works and engineering design coordination delivered as an integrated closeout package for construction projects.",
      lead:
        "Zakir Enterprise delivers building finishing works and end-phase engineering design coordination — completing structures to a fully finished, functional and document-ready standard with MEP integration, architectural finishes and formal handover.",
      body: [
        "Our finishing teams work from approved drawings and snag lists to bring partially complete or structurally complete buildings to full operational standard — covering plastering, tiling, waterproofing, painting, joinery, external works and MEP system activation as one coordinated scope.",
        "End engineering design services cover design review, constructability checking, drawing coordination and consultant management for clients who require engineering oversight during the planning and pre-construction phases of their projects.",
      ],
      bullets: [
        "Plaster, screed, tiling and floor finishing works",
        "Waterproofing systems for roofs, bathrooms and basements",
        "Joinery, glazing, doors and window installation",
        "Painting, cladding and external envelope finishing",
        "MEP activation, testing and commissioning coordination",
        "Snag management and formal project closeout",
      ],
    },
    scopeTitle: "From design review and architectural finishes to MEP activation, snag closure and documented handover.",
    scopeLead: "Finishing works require sequenced trade coordination, material quality control and structured defect management to bring a building from structural completion to full occupancy standard.",
    processTitle: "Five coordinated stages from design review through finishing works to snag closure and handover.",
    processLead: "Finishing delivery follows a structured sequence — design review, mobilization, MEP integration, surface finishes, snag management — with trade coordination and quality inspection at each stage.",
    benefitsTitle: "Selected for integrated finishing capability, design coordination and snag management.",
    benefitsLead: "Clients choose Zakir Enterprise for finishing works because we coordinate all trades — architecture, MEP, joinery, waterproofing — under one principal contractor with structured defect tracking.",
    capabilityTitle: "Plastering, waterproofing, cladding and MEP testing equipment for building finishes.",
    capabilityLead: "From rendering machines and waterproofing applicators to MEP test rigs and snag inspection tools — our finishing fleet is matched to every element from structural completion to formal handover.",
    capabilityBodyTitle: "Integrated finishing and engineering design coordination under one team.",
    capabilityBodyDesc: "Our finishing teams coordinate all specialist trades — plaster and tiling to joinery, MEP commissioning and defect management — to bring buildings from structural completion to full occupancy standard under one programme.",
    faqTitle: "Questions about finishing works and engineering design services.",
    faqLead: "Practical answers to what developers, building owners and contractors ask before engaging Zakir Enterprise for building completion, interior finishing and engineering design coordination.",
    scope: [
      {
        icon: "finish",
        title: "Engineering Design Review & Coordination",
        body: "Review of structural, MEP and architectural drawings for constructability, clash detection and buildability.",
      },
      {
        icon: "building",
        title: "Architectural Finishing Works",
        body: "Plaster, render, screed, floor tiling, ceiling systems and wall finishes to approved specifications.",
      },
      {
        icon: "drain",
        title: "Waterproofing & Tanking Systems",
        body: "Roof waterproofing, bathroom tanking, basement waterproofing and wet area protection installation.",
      },
      {
        icon: "special",
        title: "Joinery, Glazing & External Envelope",
        body: "Timber and aluminium joinery, curtain wall, window, door and external cladding installation.",
      },
      {
        icon: "equip",
        title: "MEP System Coordination & Testing",
        body: "Electrical, plumbing and HVAC system activation checks, commissioning coordination and testing.",
      },
      {
        icon: "concrete",
        title: "Snag Management & Closeout",
        body: "Structured defect survey, snag tracking, resolution sign-off and final documentation package.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Design Review & Planning",
        body: "Drawing review, finishing schedule development and material approval process.",
      },
      {
        tag: "Phase 02",
        title: "Finishing Mobilization",
        body: "Subcontractor coordination, material procurement and workface planning.",
      },
      {
        tag: "Phase 03",
        title: "Structural & MEP Integration",
        body: "Mechanical, electrical and plumbing rough-in works coordinated with architectural finishing.",
      },
      {
        tag: "Phase 04",
        title: "Interior & Surface Finishing",
        body: "All architectural finishes applied to specification with inspection at each stage.",
      },
      {
        tag: "Phase 05",
        title: "Snag Closure & Handover",
        body: "Structured defect survey, closure verification and completion documentation package.",
      },
    ],
    benefits: [
      {
        icon: "finish",
        title: "Design-Build Coordination Expertise",
        body: "Engineering design review and constructability checking integrated with physical works delivery.",
      },
      {
        icon: "building",
        title: "Full Finishing Scope Under One Team",
        body: "Architecture, MEP, joinery and external works coordinated by one accountable finishing contractor.",
      },
      {
        icon: "special",
        title: "BNBC Compliance Awareness",
        body: "Finishing works referenced to Bangladesh National Building Code requirements for safety and standards.",
      },
      {
        icon: "drain",
        title: "Structured Snag Management",
        body: "Defect tracking system ensures all snag items are closed and verified before formal handover.",
      },
      {
        icon: "equip",
        title: "MEP Coordination Capability",
        body: "Electrical, plumbing and mechanical systems coordinated within the finishing scope for full activation.",
      },
      {
        icon: "concrete",
        title: "Quality Closeout Documentation",
        body: "As-built drawings, material certificates, test records and handover manual delivered at completion.",
      },
    ],
    machine: [
      { t: "Finishing & Plastering Tools", d: "Rendering machines, screeding equipment and plastering tools for wall and floor finishes." },
      { t: "Dry Lining & Ceiling Systems", d: "Metal stud, drywall and suspended ceiling installation equipment." },
      { t: "Waterproofing Application Units", d: "Torch-on membrane, liquid membrane and injection equipment for waterproofing works." },
      { t: "Joinery & Glazing Tools", d: "Aluminium frame cutting, welding and glazing tools for fenestration works." },
      { t: "MEP Testing Instruments", d: "Pipe pressure test rigs, electrical test meters and commissioning instruments." },
      { t: "Quality Inspection Equipment", d: "Crack gauges, moisture meters and surface finish measuring tools for snag inspection." },
    ],
    faq: [
      {
        q: "What does Zakir Enterprise's finishing works service cover?",
        a: "We cover the full finishing scope — plaster, screed, tiles, waterproofing, joinery, painting, external cladding, MEP testing and snag management — as an integrated package from structural completion to handover.",
      },
      {
        q: "Can you join a project at the finishing stage only?",
        a: "Yes. We regularly onboard at finishing stage, carry out a detailed condition survey and defect register before committing scope, and take responsibility for completing the project to handover standard.",
      },
      {
        q: "How do you manage subcontractors and specialist trades on finishing works?",
        a: "We act as the principal finishing contractor, managing all specialist trades — tilers, painters, joiners, waterproofers and MEP sub-contractors — under a single programme and quality inspection regime.",
      },
      {
        q: "What engineering design services do you provide?",
        a: "We offer structural and civil drawing review, constructability checking, clash identification, design coordination with consultants and engineering oversight during pre-construction phases.",
      },
    ],
  },

  // ─── 11. Building Construction (Residential, Commercial & Industrial) ────
  {
    slug: "building-construction-residential-commercial-and-industrial",
    title: "Building Construction (Residential, Commercial & Industrial)",
    icon: "equip",
    serviceNo: 11,
    totalServices: 11,
    subtitle:
      "From multi-storey commercial facilities to institutional and residential builds with safety-led execution and schedule discipline.",
    heroImage:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80&auto=format&fit=crop",
    machineImage:
      "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&q=80&auto=format&fit=crop",
    ctaImage: CTA_IMAGE,
    meta: [
      { k: "Service Category", v: "Building Construction" },
      { k: "Execution Model", v: "Full Lifecycle Delivery" },
      { k: "Building Type", v: "RC Frame & Load-Bearing" },
      { k: "Delivery Reach", v: "Nationwide" },
    ],
    overview: {
      title:
        "Building construction delivered from foundation to finishing for residential, commercial and industrial clients across Bangladesh.",
      lead:
        "Zakir Enterprise provides complete building construction services — from piling and foundation through structural frame, masonry, MEP and finishing — for residential towers, commercial facilities, industrial plants and institutional buildings.",
      body: [
        "Each building project is executed under a RAJUK-compliant construction program with QA-controlled RCC works, certified materials, HSE-managed site operations and coordinated MEP integration — ensuring the finished building meets safety, structural and functional standards from day one of occupation.",
        "Our building teams have experience across multi-storey RC frame structures, load-bearing masonry buildings, industrial sheds and institutional facilities — with the schedule discipline and quality documentation that developers, occupiers and authorities require.",
      ],
      bullets: [
        "Foundation, piling and sub-structure works",
        "Multi-storey RCC structural frame construction",
        "Masonry, blockwork and external envelope",
        "MEP rough-in, installation and system commissioning",
        "Architectural finishing and interior fit-out",
        "RAJUK compliance and project handover documentation",
      ],
    },
    scopeTitle: "Complete building delivery from foundation to finishing under one accountable construction team.",
    scopeLead: "Residential, commercial and industrial builds require disciplined execution across piling, structural frame, envelope, MEP and finishing — all coordinated to one program and quality standard.",
    processTitle: "Five delivery phases from design coordination and foundation to MEP, finishing and handover.",
    processLead: "Building delivery follows a disciplined sequence — design, foundation, structural frame, MEP and finishes — with programme monitoring, QA documentation and RAJUK compliance applied throughout.",
    benefitsTitle: "Selected for multi-storey expertise, RCC quality control and full-lifecycle delivery.",
    benefitsLead: "Developers and building owners choose Zakir Enterprise because we control quality from piling through structural frame, MEP and finishing — with RAJUK compliance and safety-led site management throughout.",
    capabilityTitle: "Tower cranes, concrete batching and structural systems for multi-storey building works.",
    capabilityLead: "From tower cranes and on-site concrete batching to table formwork, MEP installation tools and scaffolding safety systems — our building fleet supports full lifecycle construction delivery.",
    capabilityBodyTitle: "Full building lifecycle delivery from foundation piling to architectural finishing.",
    capabilityBodyDesc: "Our building teams combine structural RCC expertise, coordinated MEP installation and quality finishing management — delivering residential, commercial and industrial buildings with documented compliance from foundation to handover.",
    faqTitle: "Questions about building construction services.",
    faqLead: "Answers to what developers, institutional clients and building owners ask most often before engaging Zakir Enterprise for residential, commercial or industrial building construction.",
    scope: [
      {
        icon: "foundation",
        title: "Foundation & Sub-Structure",
        body: "Piling, pile caps, raft, ground beams and basement construction to structural drawings and geotechnical specification.",
      },
      {
        icon: "concrete",
        title: "Structural Frame Construction",
        body: "Multi-storey RCC column, beam, slab, core wall and staircase construction with formwork and concrete QA.",
      },
      {
        icon: "building",
        title: "Masonry & External Envelope",
        body: "Brick, block and panel wall construction, external render, cladding and glazed facade installation.",
      },
      {
        icon: "drain",
        title: "MEP Rough-In & Installation",
        body: "Electrical, plumbing, HVAC and fire suppression rough-in works coordinated with structural and finishing program.",
      },
      {
        icon: "finish",
        title: "Architectural Finishing & Fit-Out",
        body: "Full interior finishing — floors, walls, ceilings, joinery, doors and external landscaping — to approved specifications.",
      },
      {
        icon: "special",
        title: "RAJUK Compliance & Handover",
        body: "Authority compliance support, occupancy certificate documentation and final client project handover.",
      },
    ],
    process: [
      {
        tag: "Phase 01",
        title: "Design Coordination",
        body: "Architectural, structural and MEP drawing coordination, BoQ review and construction program.",
      },
      {
        tag: "Phase 02",
        title: "Foundation & Structure",
        body: "Piling, foundation and structural frame construction with QA and milestone reporting.",
      },
      {
        tag: "Phase 03",
        title: "Superstructure Build",
        body: "Masonry, external envelope, roof structure and above-ground structural works.",
      },
      {
        tag: "Phase 04",
        title: "MEP & Finishing",
        body: "Services installation, architectural finishing, fit-out and snag management.",
      },
      {
        tag: "Phase 05",
        title: "Inspection & Handover",
        body: "Authority inspection support, snag closure and formal building handover with documentation.",
      },
    ],
    benefits: [
      {
        icon: "building",
        title: "Multi-Storey Construction Experience",
        body: "Proven delivery on commercial towers, residential developments and institutional buildings up to 20+ storeys.",
      },
      {
        icon: "concrete",
        title: "RCC Frame Specialists",
        body: "QA-controlled reinforced concrete frame works with cube testing, rebar certification and pour records.",
      },
      {
        icon: "drain",
        title: "MEP Coordination Capability",
        body: "Electrical, plumbing and mechanical services coordinated and installed within the building scope.",
      },
      {
        icon: "special",
        title: "RAJUK Compliance Awareness",
        body: "Familiar with Bangladesh building authority requirements for structural safety and occupancy certification.",
      },
      {
        icon: "equip",
        title: "Safety-First Site Execution",
        body: "HSE-managed multi-level sites with fall protection, scaffolding standards and active risk controls.",
      },
      {
        icon: "finish",
        title: "Quality Finishing Standards",
        body: "Finishing works delivered to developer, owner or occupier specification with structured snag management.",
      },
    ],
    machine: [
      { t: "Tower Cranes & Hoists", d: "Vertical material handling and structural lifting for multi-storey building construction." },
      { t: "Concrete Batching Plants", d: "On-site or nearby batching for specification-controlled structural concrete." },
      { t: "Formwork & Shoring Systems", d: "Table forms, climbing formwork and propping systems for repetitive floor construction." },
      { t: "Masonry & Plastering Tools", d: "Block cutters, mortar mixers, rendering machines and scaffolding for envelope works." },
      { t: "MEP Installation Equipment", d: "Conduit benders, pipe threading machines, duct fabrication and testing instruments." },
      { t: "Safety & Access Systems", d: "Scaffolding, safety nets, edge protection and man-lifting platforms for site safety." },
    ],
    faq: [
      {
        q: "Does Zakir Enterprise handle both residential and commercial building construction?",
        a: "Yes. We construct residential towers, commercial offices, industrial facilities and institutional buildings — the team, methods and quality controls are adapted to the specific building type and client requirements.",
      },
      {
        q: "How do you ensure structural quality in multi-storey building construction?",
        a: "We maintain a full concrete register with cube test results, rebar mill certificates and pour records for every structural element — and conduct formwork and reinforcement inspections before each pour.",
      },
      {
        q: "Can you manage the entire project from piling to finishing as one contract?",
        a: "Yes. We offer a single-contract full building delivery — from piling and foundation through structural frame, MEP, finishing and RAJUK compliance documentation — under one accountable team.",
      },
      {
        q: "How is site safety managed on multi-storey building sites?",
        a: "We enforce a structured HSE plan with fall arrest systems, scaffolding standards, lifting safety protocols and daily toolbox talks on all active building sites — HSE is not optional on any Zakir Enterprise project.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceRecord | undefined {
  const normalizedSlug = slug.trim().toLowerCase();
  return SERVICES.find((service) => service.slug.toLowerCase() === normalizedSlug);
}

export function getServiceSlugByTitle(title: string): string | undefined {
  const normalizedTitle = title.trim().toLowerCase();
  return SERVICES.find((service) => service.title.trim().toLowerCase() === normalizedTitle)?.slug;
}
