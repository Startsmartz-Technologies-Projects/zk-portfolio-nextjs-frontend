import type { listConcerns, getConcern } from "@/lib/data/concerns";

export type ConcernListItem = Awaited<ReturnType<typeof listConcerns>>["data"][number];
export type ConcernDetail = Awaited<ReturnType<typeof getConcern>>;

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
