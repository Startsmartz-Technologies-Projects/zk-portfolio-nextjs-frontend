import type { listCertifications, getCertification, setHomeSeals } from "@/lib/data/certifications";

export type CertListItem = Awaited<ReturnType<typeof listCertifications>>["data"][number];
export type CertDetail = Awaited<ReturnType<typeof getCertification>>;
export type HomeSealItem = Awaited<ReturnType<typeof setHomeSeals>>["home_seals"][number];

export const CERT_STATUSES = ["Active", "Completed", "Expired", "Renewed"] as const;
export const TONES = ["paper", "slate", "cream"] as const;
export const SEAL_SHAPES = ["round", "hex"] as const;
