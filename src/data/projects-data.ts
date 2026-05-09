export type ProjectStatus = "Completed" | "Ongoing" | "Planning";

export interface ProjectScope {
  icon: string;
  n: string;
  t: string;
  d: string;
}

export interface ProjectHighlight {
  num: string;
  unit: string;
  title: string;
  body: string;
}

export interface ProjectDetail {
  client: string;
  projectType: string;
  overviewTitle: string;
  overviewBody: string;
  pullQuote: string;
  servicesDelivered: string[];
  scopes: ProjectScope[];
  scopeDescription: string;
  galleryHeading: string;
  galleryDescription: string;
  highlightsDescription: string;
  highlights: ProjectHighlight[];
  caseStudyChallenge: string;
  caseStudyApproach: string;
  caseStudyResult: string;
  ctaHeading: string;
  gallery: string[];
}

export interface ProjectRecord {
  id: string;
  cat: string;
  type: string;
  status: ProjectStatus;
  location: string;
  title: string;
  year: string;
  duration: string;
  img: string;
  badge: string;
  badgeClass?: string;
  summary: string;
  detail: ProjectDetail;
}

const PROJECT_IMAGES = {
  skyline:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=80&auto=format&fit=crop",
  crane:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
  bridge:
    "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=1400&q=80&auto=format&fit=crop",
  tower:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1776939227/bridge_hero_zox21k.jpg",
  road: "https://res.cloudinary.com/dk4csiouq/image/upload/q_auto/f_auto/v1776917191/patuakhali_project_section_hero_nqcinq.jpg",
  bridgeAlt:
    " https://res.cloudinary.com/dk4csiouq/image/upload/v1777265050/SKCD_updated_hero_1_ndt0oa.jpg",
  earth:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop",
  concrete:
    "https://images.unsplash.com/photo-1565008576549-57569a49371c?w=1200&q=80&auto=format&fit=crop",
  found:
    "https://images.unsplash.com/photo-1518335935020-cfd6580c1ab4?w=1200&q=80&auto=format&fit=crop",
  siteteam:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop",
  interior:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
  apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop",
  machinery:
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80&auto=format&fit=crop",
  warehouse:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop",
  highway:
    "https://images.unsplash.com/photo-1573108724029-4c46571d6490?w=1200&q=80&auto=format&fit=crop",
  blueprint:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
  mosque:
    "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271735/Central_Mosque-cumilla_cant.-hero_section_mx6wco.jpg",
  skcd: "https://res.cloudinary.com/dk4csiouq/image/upload/v1776939518/SKCD_Dreams_hero_wdvl2j.jpg",
};

const BASE_PROJECTS = [
  {
    id: "P001",
    cat: "Bridge work",
    type: "Government",
    status: "Completed",
    location: "Rampura, Dhaka",
    title: "49m All Traffic Steel Arch Bridge",
    year: "2025",
    duration: "22 months",
    img: PROJECT_IMAGES.tower,
    badge: "Government",
    badgeClass: "lime",
    summary:
      "A major government infrastructure project in Rampura, Dhaka delivering three bridges under one contract: two double-lane all-traffic steel bridges with footpath connecting Banasree with Aftab Nagar, and a dedicated pedestrian bridge over Rampura Khal.",
  },
  {
    id: "P002",
    cat: "Government project",
    type: "Government",
    status: "Completed",
    location: "Patuakhali, Bangladesh",
    title: "Patuakhali Naval Warehouse",
    year: "2025",
    duration: "4-5 months",
    img: PROJECT_IMAGES.road,
    badge: "Government",
    badgeClass: "black",
    summary:
      "A purpose-built government warehouse delivering secure, large-span storage for the Bangladesh Navy's southern coastal operations ",
  },
  {
    id: "P003",
    cat: "Building construction",
    type: "Infrastructure",
    status: "Ongoing",
    location: "Mouza Lalalsarat, Cantonment, Dhaka",
    title: "SKCD Dream - G+7 Residential Building",
    year: "2026",
    duration: "2.5 Years",
    img: PROJECT_IMAGES.skcd,
    badge: "Infrastructure",
    badgeClass: "gold",
    summary:
      "An 8-storied premium residential building rising in the heart of Dhaka Cantonment - 14 units per floor, two apartment types, and a modern curved facade that's already turning heads on Road",
  },
  {
    id: "P004",
    cat: "Government project",
    type: "Religious / Institutional Construction",
    status: "Completed",
    location: "Comilla University, Kotbari, Comilla",
    title: "Central Mosque",
    year: "2024",
    duration: "Ongoing",
    img: PROJECT_IMAGES.mosque,
    badge: "Institutional Construction",
    summary:
      "A three-storied central mosque built for 24 ECB Brigade at Comilla University accommodating 10,000 worshippers across two dedicated prayer floors, with ground floor parking and a total built area of 9,380 sq.m",
  },
  // {
  //   id: "P005",
  //   cat: "Structural Concrete",
  //   type: "Commercial",
  //   status: "Completed",
  //   location: "Chattogram EPZ",
  //   title: "RCC Framework, Warehouse Facility",
  //   year: "2024",
  //   duration: "11 months",
  //   img: PROJECT_IMAGES.warehouse,
  //   badge: "Completed",
  //   summary:
  //     "45,000 sqft RCC framework with heavy-load slab design for export-oriented logistics operations.",
  // },
  // {
  //   id: "P006",
  //   cat: "Foundation Work",
  //   type: "Commercial",
  //   status: "Completed",
  //   location: "Riverside, Dhaka",
  //   title: "Deep Pile Foundation - 340 Piles",
  //   year: "2023",
  //   duration: "8 months",
  //   img: PROJECT_IMAGES.found,
  //   badge: "Completed",
  //   summary:
  //     "Cast-in-situ bored piles extending to 42m depth supporting a mixed-use riverside development.",
  // },
  // {
  //   id: "P007",
  //   cat: "Building Construction",
  //   type: "Private",
  //   status: "Completed",
  //   location: "Banani, Dhaka",
  //   title: "Premium Residential Tower, 12 Floors",
  //   year: "2025",
  //   duration: "19 months",
  //   img: PROJECT_IMAGES.apartment,
  //   badge: "Private",
  //   badgeClass: "black",
  //   summary:
  //     "High-end apartment block featuring imported finishes, dual-lift core and architectural landscaping.",
  // },
  // {
  //   id: "P008",
  //   cat: "Road Works",
  //   type: "Government",
  //   status: "Ongoing",
  //   location: "Sylhet Division",
  //   title: "Regional Highway Expansion",
  //   year: "2026",
  //   duration: "In progress",
  //   img: PROJECT_IMAGES.highway,
  //   badge: "Ongoing",
  //   badgeClass: "gold",
  //   summary:
  //     "Widening and resurfacing of 38km regional route including new culvert structures and road markings.",
  // },
  // {
  //   id: "P009",
  //   cat: "Commercial Works",
  //   type: "Commercial",
  //   status: "Completed",
  //   location: "Motijheel, Dhaka",
  //   title: "Bank Branch Renovation Programme",
  //   year: "2024",
  //   duration: "6 months",
  //   img: PROJECT_IMAGES.interior,
  //   badge: "Completed",
  //   summary:
  //     "Interior build-out across 7 banking branches including security works, electricals and finishing.",
  // },
  // {
  //   id: "P010",
  //   cat: "Bridge Works",
  //   type: "Infrastructure",
  //   status: "Completed",
  //   location: "Barishal",
  //   title: "Reinforced Culvert Network - 12 Units",
  //   year: "2023",
  //   duration: "10 months",
  //   img: PROJECT_IMAGES.bridge,
  //   badge: "Completed",
  //   summary:
  //     "Box-culvert construction programme replacing aged drainage structures across flood-prone roads.",
  // },
  // {
  //   id: "P011",
  //   cat: "Private Residential",
  //   type: "Private",
  //   status: "Planning",
  //   location: "Uttara, Dhaka",
  //   title: "Duplex Residence Compound",
  //   year: "2026",
  //   duration: "Kickoff Q2",
  //   img: PROJECT_IMAGES.siteteam,
  //   badge: "Private",
  //   badgeClass: "black",
  //   summary:
  //     "Six-unit duplex compound with shared amenity deck, underground parking and architectural landscaping.",
  // },
  // {
  //   id: "P012",
  //   cat: "Structural Concrete",
  //   type: "Industrial",
  //   status: "Completed",
  //   location: "Gazipur",
  //   title: "Factory Expansion - Phase II",
  //   year: "2024",
  //   duration: "12 months",
  //   img: PROJECT_IMAGES.concrete,
  //   badge: "Completed",
  //   summary:
  //     "Structural extension adding 28,000 sqft production floor with reinforced mezzanine and crane rails.",
  // },
] as const;

const DEFAULT_PROJECT_SCOPES: ProjectScope[] = [
  {
    icon: "concrete",
    n: "01",
    t: "RCC Superstructure",
    d: "RCC Substructure — Foundations, piers and abutments built to government spec across all three bridge sites simultaneously.",
  },
  {
    icon: "building",
    n: "02",
    t: "Pre-Engineered Steel Roof",
    d: "Steel Arch Fabrication & Erection — Structural steel arch superstructure for the 49m main bridge, fabricated and erected by specialist steel teams.",
  },
  {
    icon: "equip",
    n: "03",
    t: "Equipment Integration",
    d: "38m All-Traffic Bridge — Full construction of the second all-traffic bridge with integrated footpath, running parallel to the main arch structure.",
  },
  {
    icon: "fire",
    n: "04",
    t: "Fire Safety System",
    d: "42m Pedestrian Bridge — Dedicated pedestrian-only crossing over Rampura Khal, independently designed and constructed for safe foot traffic.",
  },
  {
    icon: "mep",
    n: "05",
    t: "MEP Works",
    d: "Deck & Footpath Works — Bridge deck construction across all traffic bridges including integrated footpaths up to 15.40m deck width on the main span.",
  },
  {
    icon: "window",
    n: "06",
    t: "Security and Enclosure",
    d: "Steel Fabrication & Connection Works — On-site steel assembly, bolting and welding of all arch members, deck supports and connection joints across all three structures.",
  },
  {
    icon: "earth",
    n: "07",
    t: "Site Preparation",
    d: "Site Safety Management — Strict zero-compromise safety programme managing 100–120 workers across three concurrent bridge construction sites in urban Dhaka..",
  },
  {
    icon: "floor",
    n: "08",
    t: "Industrial Floor System",
    d: "Site Preparation & Temporary Works — Site setup, khal access management, temporary falsework and shoring installed before permanent works began on all three bridges.",
  },
];

const PROJECT_DETAIL_OVERRIDES: Partial<
  Record<string, Partial<ProjectDetail>>
> = {
  P001: {
    overviewBody:
      "The first is a 49m all-traffic steel arch bridge with a 15.40m deck accommodating double lanes plus footpath. Running alongside it is a 38m all-traffic bridge also carrying a footpath for pedestrians. And separately, a 42m pedestrian-only bridge crosses Rampura Khal - giving foot traffic a safe, dedicated route away from vehicles entirely. All three sit on RCC substructures, all three started December 6, 2025, and all three are being delivered by the same team of 100 to 120 workers under a single government contract worth 50 Crore BDT.",
    gallery: [
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776939227/bridge_hero_zox21k.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777109606/IMG-20250910-WA0017_utwbd4.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777109603/IMG-20250910-WA0015_jgf8un.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777109602/IMG-20250910-WA0019_nh2uem.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777109601/IMG-20250910-WA0014_co37c0.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777109601/IMG-20250910-WA0018_btrc1q.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777109596/IMG-20250910-WA0016_o2472b.jpg",
    ],
  },
  P002: {
    client: "Bangladesh Government Navy",
    projectType: "Industrial Warehouse Construction",
    overviewTitle:
      "Built tough, handed over fast a naval warehouse the southern coast can depend on.",
    overviewBody:
      "Patuakhali is not the easiest place to run a construction project. The coastal conditions, remote location, and tight government timeline made delivery complex. Within 4 to 5 months, the team took this site from bare ground to a fully handed-over naval warehouse, ready for immediate operations. Every structural decision was made with end use in mind - heavy naval equipment, long-term coastal durability, and strict government security standards.",
    pullQuote:
      "No delays. No incidents. Just a building the Bangladesh Navy could actually rely on.",
    servicesDelivered: [
      "RCC Superstructure",
      "Pre-Engineered Steel Roof",
      "EOT Overhead Crane System",
      "Fire Suppression System",
      "MEP Works",
      "Security Fenestration",
      "Site Preparation",
      "Heavy-Duty Warehouse Floor",
    ],
    scopes: [
      {
        icon: "concrete",
        n: "01",
        t: "RCC Superstructure",
        d: "Concrete frame built to heavy load-bearing specs, designed to store and support serious naval equipment and supplies long-term.",
      },
      {
        icon: "building",
        n: "02",
        t: "Pre-Engineered Steel Roof",
        d: "Wide-span steel truss system with blue corrugated cladding and polycarbonate skylights for maximum internal height and natural light.",
      },
      {
        icon: "equip",
        n: "03",
        t: "EOT Overhead Crane System",
        d: "Overhead travelling crane infrastructure installed across the full floor span for safe movement of heavy naval cargo.",
      },
      {
        icon: "fire",
        n: "04",
        t: "Fire Suppression System",
        d: "Full ceiling-mounted red-pipe fire safety network spanning the entire warehouse floor, commissioned before handover.",
      },
      {
        icon: "mep",
        n: "05",
        t: "MEP Works",
        d: "Industrial lighting, electrical systems, ventilation ducting and plumbing installed for round-the-clock warehouse operations.",
      },
      {
        icon: "window",
        n: "06",
        t: "Security Fenestration",
        d: "Double-band windows with heavy iron grilles across the full perimeter, meeting government security requirements.",
      },
      {
        icon: "earth",
        n: "07",
        t: "Site Preparation",
        d: "Coastal site clearing, levelling and drainage groundworks completed before any structural work commenced.",
      },
      {
        icon: "floor",
        n: "08",
        t: "Heavy-Duty Warehouse Floor",
        d: "Thick industrial concrete slab laid and finished to withstand forklifts, trolleys and heavy equipment without degradation.",
      },
    ],
    caseStudyChallenge:
      "Constructing a government-grade naval warehouse in a coastal zone under a strict 4-5 month deadline with no margin for delay.",
    caseStudyApproach:
      "Concurrent roofing and civil works to compress the schedule, weekly on-site reviews, and strict structural tolerances throughout.",
    caseStudyResult:
      "A fully operational, crane-equipped, fire-safe naval warehouse handed over on time to the Bangladesh Navy's southern coastal command.",
    ctaHeading: "Need a warehouse built to government standard?",
    gallery: [
      "https://res.cloudinary.com/dk4csiouq/image/upload/q_auto/f_auto/v1776917191/patuakhali_project_section_hero_nqcinq.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918075/patuakhali_project_Gallary_1_nufw4p.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918074/patuakhali_project_Gallary_2_lchgzc.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918072/patuakhali_project_Gallary_3_agpdlx.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918072/patuakhali_project_Gallary_4_geulax.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918070/patuakhali_project_Gallary_5_btqqrf.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918069/patuakhali_project_Gallary_6_xhtnwd.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918069/patuakhali_project_Gallary_7_gpzegp.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918066/patuakhali_project_Gallary_8_hvrt85.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918064/patuakhali_project_Gallary_9_ozhlbz.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918063/patuakhali_project_Gallary_10_my0yme.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918067/patuakhali_project_Gallary_11_odi3el.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918067/patuakhali_project_Gallary_12_dxfub4.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776918065/patuakhali_project_Gallary_13_z1mjzg.jpg",
    ],
  },
  P003: {
    client: "Sena Kalyan Constructions & Developments Ltd. (SKCD)",
    projectType: "Private Residential Construction",
    overviewTitle:
      "Eight floors of considered living, built where precision actually matters.",
    overviewBody:
      "Cantonment Dhaka isn't a forgiving place to build. 2 units per floor. Two apartment types — Type A at ±1926 sft and Type B at ±1640 sft — spread across 7 floors of living space above ground. The building is designed by HDD and carries a distinctive curved facade with generous balconies and integrated greenery that makes it stand out from everything else in the neighbourhood. At 63 Crore BDT and 2.5 years in the making, this isn't a project where corners get cut. The full scope runs from deep foundation through to interior finishing and facade works — all delivered under one contract, with safety treated as non-negotiable from day one.",
    pullQuote:
      "No delays. No incidents. Just a building the Bangladesh Navy could actually rely on.",
    servicesDelivered: [
      "RCC Superstructure",
      "Steel Arch Fabrication & Erection",
      "38m All-Traffic Bridge",
      "42m Pedestrian Bridge",
      "Deck & Footpath Works",
      "Steel Fabrication & Connection Works",
      "Site Safety Management",
      "Site Preparation & Temporary Works",
    ],
    scopes: [
      {
        icon: "concrete",
        n: "01",
        t: "RCC Superstructure",
        d: "Foundations, piers and abutments built to government spec across all three bridge sites simultaneously.",
      },
      {
        icon: "building",
        n: "02",
        t: "Steel Arch Fabrication & Erection",
        d: "Structural steel arch superstructure for the 49m main bridge, fabricated and erected by specialist steel teams.",
      },
      {
        icon: "equip",
        n: "03",
        t: "38m All-Traffic Bridge",
        d: "Full construction of the second all-traffic bridge with integrated footpath, running parallel to the main arch structure.",
      },
      {
        icon: "fire",
        n: "04",
        t: "42m Pedestrian Bridge",
        d: "Dedicated pedestrian-only crossing over Rampura Khal, independently designed and constructed for safe foot traffic.",
      },
      {
        icon: "mep",
        n: "05",
        t: "Deck & Footpath Works",
        d: "Bridge deck construction across all traffic bridges including integrated footpaths up to 15.40m deck width on the main span.",
      },
      {
        icon: "window",
        n: "06",
        t: "Steel Fabrication & Connection Works",
        d: "On-site steel assembly, bolting and welding of all arch members, deck supports and connection joints across all three structures.",
      },
      {
        icon: "earth",
        n: "07",
        t: "Site Safety Management",
        d: "Strict zero-compromise safety programme managing 100–120 workers across three concurrent bridge construction sites in urban Dhaka.",
      },
      {
        icon: "floor",
        n: "08",
        t: "Site Preparation & Temporary Works",
        d: "Site setup, khal access management, temporary falsework and shoring installed before permanent works began on all three bridges.",
      },
    ],
    caseStudyChallenge:
      "8 Floors of premium residential space delivered in Dhaka Cantonment",
    caseStudyApproach:
      "14 Units per floor across Type A (±1926 sft) and Type B (±1640 sft)",
    caseStudyResult: "0 Safety incidents — 100% safety maintained throughout",
    ctaHeading: "Planning a residential build that needs to be done properly?",
    gallery: [
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1776939518/SKCD_Dreams_hero_wdvl2j.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110616/21_jdwj2x.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777265050/SKCD_updated_hero_1_ndt0oa.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110532/3D_PLAN_Even_level_xwisji.png",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110508/3D_PLAN_Ground_level_j9exjo.png",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110498/19_capapw.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110439/14_y32w3w.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110438/18_cd4kfv.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110418/16_ktdd0w.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777110412/23_w63dch.jpg",
    ],
  },
  P004: {
    gallery: [
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271735/Central_Mosque-cumilla_cant.-hero_section_mx6wco.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271733/Central_Mosque-cumilla_cant_1_vltssv.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271734/Central_Mosque-cumilla_cant_2_sp6jco.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271738/Central_Mosque-cumilla_cant_3_imz1uk.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271739/Central_Mosque-cumilla_cant_4_mduyfb.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271733/Central_Mosque-cumilla_cant_5_sd9386.jpg",
      "https://res.cloudinary.com/dk4csiouq/image/upload/v1777271736/Central_Mosque-cumilla_cant_6_ksfjir.jpg",
    ],
  },
};

export const PROJECTS: ProjectRecord[] = BASE_PROJECTS.map((project) => {
  const override = PROJECT_DETAIL_OVERRIDES[project.id] ?? {};
  const defaultDetail: ProjectDetail = {
    client:
      project.type === "Government"
        ? "Government Client"
        : project.type === "Infrastructure" ||
            project.type === "Religious / Institutional Construction"
          ? "Commercial Client"
          : "Private Client",
    projectType: project.cat,
    overviewTitle: `Built for ${project.location}, delivered with disciplined execution.`,
    overviewBody: `This ${project.type.toLowerCase()} ${project.cat.toLowerCase()} in ${project.location} was delivered with a focus on quality, safety and schedule discipline. From mobilization to handover, the team coordinated structural works, services and finishing to match project requirements and long-term performance goals.`,
    pullQuote: project.summary,
    servicesDelivered: DEFAULT_PROJECT_SCOPES.map((scope) => scope.t),
    scopes: DEFAULT_PROJECT_SCOPES,
    scopeDescription:
      "Eight coordinated work packages delivered in sequence from site enabling works through to final handover, all under a single Zakir Enterprise contract.",
    galleryHeading: "Construction in progress.",
    galleryDescription:
      "Selected site photography capturing the foundation, superstructure, and facade phases of the project documented by our site engineering team.",
    highlightsDescription:
      "Outcomes and metrics for this project are available on request.",
    highlights: [
      {
        num: project.year,
        unit: "Year",
        title: "Delivery Window",
        body: `Primary delivery timeline aligned to ${project.year}.`,
      },
      {
        num:
          Number.parseInt(project.duration, 10) > 0
            ? String(Number.parseInt(project.duration, 10))
            : "Live",
        unit: Number.parseInt(project.duration, 10) > 0 ? "Months" : "Progress",
        title: "Execution Duration",
        body: `Project duration: ${project.duration}.`,
      },
      {
        num: project.status === "Completed" ? "100" : "In",
        unit: project.status === "Completed" ? "%" : "Motion",
        title: "Completion Status",
        body: `Current project status: ${project.status}.`,
      },
      {
        num: project.type.slice(0, 3).toUpperCase(),
        unit: "Type",
        title: "Client Segment",
        body: `${project.type} project delivered for ${project.location}.`,
      },
    ],
    caseStudyChallenge: `Delivering a ${project.cat.toLowerCase()} in ${project.location} under a fixed timeline and strict quality requirements.`,
    caseStudyApproach:
      "Phased planning, disciplined site supervision, and coordinated engineering execution across all work packages.",
    caseStudyResult: `A ${project.status.toLowerCase()} project delivered for ${project.location}, aligned with the client scope and timeline.`,
    ctaHeading: `Need support for your next ${project.cat.toLowerCase()} project?`,
    gallery: [
      project.img,
      project.img,
      project.img,
      project.img,
      project.img,
      project.img,
      project.img,
    ],
  };

  return {
    ...project,
    detail: {
      ...defaultDetail,
      ...override,
      scopes: override.scopes ?? defaultDetail.scopes,
      servicesDelivered:
        override.servicesDelivered ?? defaultDetail.servicesDelivered,
      gallery: override.gallery ?? defaultDetail.gallery,
      highlights: override.highlights ?? defaultDetail.highlights,
    },
  };
});

export const PROJECT_FILTERS = {
  categories: [
    "All",
    "Building Construction",
    "Road Works",
    "Bridge Works",
    "Private Residential",
    "Government Projects",
    "Commercial Works",
  ],
  statuses: ["All Status", "Completed", "Ongoing", "Planning"],
  types: ["All Types", "Government", "Commercial", "Private"],
  locations: [
    "All Locations",
    "Dhaka",
    "Chattogram",
    "Sylhet",
    "Cumilla",
    "Barishal",
    "Mymensingh",
    "Gazipur",
  ],
} as const;

export const PROJECT_SORTS = [
  "Most Recent",
  "Oldest First",
  "A - Z",
  "By Size",
] as const;

export const FEATURED_PROJECT_IDS = ["P001", "P002", "P003"] as const;
