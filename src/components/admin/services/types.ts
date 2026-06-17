import type { listServices, getService } from "@/lib/data/services";

export type ServiceListItem = Awaited<ReturnType<typeof listServices>>["data"][number];
export type ServiceDetail = Awaited<ReturnType<typeof getService>>;

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
