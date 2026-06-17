// Shared client-side types for the Projects admin screens (Wave 2). These mirror the
// `lib/data/projects` serializers (toListItem / toDetail) so the list, editor, and
// featured screens bind to the same shapes the server actions return.

import type {
  listProjects,
  getProject,
  setFeatured,
} from "@/lib/data/projects";

/** A row in the admin Projects list (includes content_status — admin-only). */
export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>["data"][number];

/** The full project record loaded into the editor. */
export type ProjectDetail = Awaited<ReturnType<typeof getProject>>;

/** The featured set returned by setFeatured / read on the featured screen. */
export type FeaturedItem = Awaited<ReturnType<typeof setFeatured>>["featured"][number];

/** Enum option sets — kept in sync with lib/validation/projects enums. */
export const CLIENT_TYPES = ["Government", "Commercial", "Private"] as const;
export const DELIVERY_STATUSES = ["Completed", "Ongoing", "Planning"] as const;
export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export const BADGE_STYLES = ["default", "lime", "black", "gold"] as const;
export const SORTS = ["recent", "oldest", "title", "featured"] as const;

export type ClientType = (typeof CLIENT_TYPES)[number];
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type BadgeStyle = (typeof BADGE_STYLES)[number];
export type Sort = (typeof SORTS)[number];

export const SORT_LABELS: Record<Sort, string> = {
  recent: "Most recent",
  oldest: "Oldest first",
  title: "Title (A–Z)",
  featured: "Featured order",
};

export const CONTENT_STATUS_BADGE: Record<
  ContentStatus,
  { variant: "draft" | "published" | "archived"; label: string }
> = {
  draft: { variant: "draft", label: "Draft" },
  published: { variant: "published", label: "Published" },
  archived: { variant: "archived", label: "Archived" },
};
