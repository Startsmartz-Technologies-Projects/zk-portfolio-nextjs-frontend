import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Newspaper,
  BookOpen,
  Award,
  Building2,
  FileText,
  Settings,
  Image as ImageIcon,
  Search,
  Inbox,
  Users,
  type LucideIcon,
} from "lucide-react";

import { can, type Capability } from "@/lib/users/capabilities";
import type { Role } from "@/lib/auth/jwt";

// The admin IA (foundations §3). Each item gates on a single capability key
// (lib/users/capabilities) so the sidebar + `+ Create` filter exactly match the
// server-action RBAC policy — editor vs admin, no separate UI permission list.

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Capability required to see this item; the role guard enforces it server-side too. */
  capability: Capability;
}

export interface NavGroup {
  /** Section label shown above the group; null for the ungrouped top item (Dashboard). */
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        capability: "dashboard",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Projects", href: "/admin/projects", icon: FolderKanban, capability: "content" },
      { label: "Services", href: "/admin/services", icon: Wrench, capability: "content" },
      { label: "Blog", href: "/admin/blog", icon: BookOpen, capability: "content" },
      { label: "News", href: "/admin/news", icon: Newspaper, capability: "content" },
      { label: "Certifications", href: "/admin/certifications", icon: Award, capability: "content" },
      { label: "Concerns", href: "/admin/concerns", icon: Building2, capability: "content" },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Pages", href: "/admin/pages", icon: FileText, capability: "content" },
      { label: "Site Settings", href: "/admin/site", icon: Settings, capability: "site_settings" },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Media", href: "/admin/media", icon: ImageIcon, capability: "media" },
      { label: "SEO Center", href: "/admin/seo", icon: Search, capability: "seo_config" },
      { label: "Inquiries", href: "/admin/inquiries", icon: Inbox, capability: "leads_triage" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users, capability: "user_admin" },
    ],
  },
];

// Record types the `+ Create ▾` menu offers — filtered to those the role may create.
export interface CreateItem {
  label: string;
  href: string;
  capability: Capability;
}

export const CREATE_ITEMS: CreateItem[] = [
  { label: "Project", href: "/admin/projects/new", capability: "content" },
  { label: "Service", href: "/admin/services/new", capability: "content" },
  { label: "Blog post", href: "/admin/blog/new", capability: "content" },
  { label: "News article", href: "/admin/news/new", capability: "content" },
  { label: "Certification", href: "/admin/certifications/new", capability: "content" },
  { label: "Concern", href: "/admin/concerns/new", capability: "content" },
];

/** Groups with their items filtered to the role's capabilities; empty groups dropped. */
export function visibleNavGroups(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(role, item.capability)),
  })).filter((group) => group.items.length > 0);
}

export function visibleCreateItems(role: Role): CreateItem[] {
  return CREATE_ITEMS.filter((item) => can(role, item.capability));
}
