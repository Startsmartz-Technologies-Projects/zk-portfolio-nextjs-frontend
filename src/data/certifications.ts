export type CertificationItem = {
  id: string;
  title: string;
  authority: string;
  number: string;
  category: string;
  issued: string;
  expiry: string;
  status: string;
  thumbClass: "tone-paper" | "tone-slate" | "tone-cream";
  accent: "seal-round" | "seal-hex";
  description: string;
  homeSeal: string;
  homeId: string;
  homeValid: string;
};

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: "iso-9001",
    title: "Liquid Asset Certification",
    authority: "Trust Bank",
    number: "TBL/PGT/Credit/2024/521",
    category: "Compliance",
    issued: "4/1/2024",
    expiry: "-",
    status: "Present",
    thumbClass: "tone-slate",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "ISO\n9001",
    homeId: "ID - ISO-9001:2015",
    homeValid: "Valid through 2027",
  },
  {
    id: "iso-14001",
    title: "Work Completion Certificate",
    authority: "19 Engineer Construction Battalion, Bangladesh Army",
    number: "ISO / EMS / 2024 / 51127",
    category: "Compliance",
    issued: "01/04/2024",
    expiry: "-",
    status: "Fully Completed",
    thumbClass: "tone-paper",
    accent: "seal-round",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "ISO\n14001",
    homeId: "ID - ISO-14001:2015",
    homeValid: "Valid through 2027",
  },
  {
    id: "iso-45001",
    title: "Work Experience Certificate",
    authority:
      "Jolshiri Abashon (under the 24 Engineer Construction Brigade, Dhaka Cantonment)",
    number: "ISO / OHS / 2024 / 64013",
    category: "Safety",
    issued: "19-06-22",
    expiry: "-",
    status: "Fully Completed",
    thumbClass: "tone-cream",
    accent: "seal-round",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "ISO\n45001",
    homeId: "ID - ISO-45001:2018",
    homeValid: "Valid through 2026",
  },
  {
    id: "Work Experience Certificate.",
    title: "RAJUK & 24 Engineer Construction Brigade, Bangladesh Army",
    authority: "Local Government Engineering Department",
    number: "LGED / ENLIST / CLASS-01 / 2025",
    category: "Engineering",
    issued: "4/22/2021",
    expiry: "",
    status: "Fully Completed",
    thumbClass: "tone-slate",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "LGED",
    homeId: "Class - 01 (Nationwide)",
    homeValid: "Renewed annually",
  },
  {
    id: "Work Experience Certificate",
    title:
      "16 Engineer Construction Battalion, Bangladesh Army (Hatirjheel Area Integrated Development Project)",
    authority: "Roads & Highways Department",
    number: "RHD / PQ / CAT-A / 2025 / 09340",
    category: "Engineering",
    issued: "4/1/2014",
    expiry: "Nov 2026",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-round",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "RHD",
    homeId: "Category - A Civil",
    homeValid: "Renewed annually",
  },
  {
    id: "bwdb-grade-a",
    title: "Work Experience Certificate",
    authority: "16 Engineer Construction Battalion, Bangladesh Army",
    number: "BWDB / ENLIST / GRADE-A / 2025",
    category: "Trade & Licensing",
    issued: "1/1/2013",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-cream",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BWDB",
    homeId: "Enlistment - Grade A",
    homeValid: "Renewed annually",
  },
  {
    id: "pwd-cat-1",
    title: "Completion Certificate",
    authority: "New Hope Farms Bangladesh Ltd",
    number: "PWD / CAT-1 / C&E / 2025",
    category: "Trade & Licensing",
    issued: "September 13th, 2013",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-slate",
    accent: "seal-round",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "PWD",
    homeId: "Category - 1 Civil & Elect",
    homeValid: "Renewed annually",
  },
  {
    id: "bab-member",
    title: "Work Experience Certificate",
    authority: "16 Engineer Construction Battalion, Bangladesh Army",
    number: "BAB / MEMBER / ACTIVE / 2016",
    category: "Industry Body",
    issued: "July 3, 2016",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BAB",
    homeId: "Member - Active",
    homeValid: "Since 2016",
  },
  {
    id: "bab-member",
    title: "Work Order (Outsourcing of Shore Protection Work)",
    authority: "24 Engineer Construction Brigade, Bangladesh Army",
    number: "609/Project/21/100' Wide Khal",
    category: "Industry Body",
    issued: "4/15/2018",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BAB",
    homeId: "Member - Active",
    homeValid: "Since 2016",
  },
  {
    id: "bab-member",
    title: "Work Order",
    authority: "16 Engineer Construction Battalion, Bangladesh Army",
    number: "-",
    category: "Industry Body",
    issued: "2/1/2016",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BAB",
    homeId: "Member - Active",
    homeValid: "Since 2016",
  },
  {
    id: "bab-member",
    title: "Work Experience Certificate",
    authority:
      "19 Engineer Construction Battalion, Bangladesh Army (Sheikh Russel Cantonment, Shariatpur)",
    number: "-",
    category: "Industry Body",
    issued: "01/04/2024",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BAB",
    homeId: "Member - Active",
    homeValid: "Since 2016",
  },
  {
    id: "bab-member",
    title: "Work Experience Certificate",
    authority:
      "19 Engineer Construction Battalion, Bangladesh Army (Sheikh Russel Cantonment, Shariatpur)",
    number: "-",
    category: "Industry Body",
    issued: "01/04/2024",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BAB",
    homeId: "Member - Active",
    homeValid: "Since 2016",
  },
  {
    id: "bab-member",
    title: "Notification of Award",
    authority:
      "4 River Proj Bogura (C/O: 24 Engineer Construction Brigade, Dhaka Cantonment)",
    number: "609/Project/4 Riv Proj/Pkg-12.",
    category: "Industry Body",
    issued: "02 November 2020.",
    expiry: "-",
    status: "Active",
    thumbClass: "tone-paper",
    accent: "seal-hex",
    description:
      "Work Experience certification covering project planning, procurement, site execution, and delivery controls.",
    homeSeal: "BAB",
    homeId: "Member - Active",
    homeValid: "Since 2016",
  },
];
