import type { UpdatePageInput } from "@/lib/validation/pages";
import type { PageAdmin, SectionAdmin, SectionItemAdmin } from "./types";
import { seoFromDetail, type SeoFormValues } from "@/src/components/admin/shared/seo-form-fields";

// Map the admin page shape (snake_case, resolved media refs) ↔ the updatePage server
// input. The editor holds the admin shape in state; on save it converts to the
// { seo, sections } input (full-replace semantics — pages-be-2 updatePage).

const blank = (s: string | null | undefined): string | null => {
  const t = (s ?? "").trim();
  return t ? t : null;
};

function itemToInput(i: SectionItemAdmin) {
  return {
    icon: blank(i.icon),
    image_id: i.image && "id" in i.image ? i.image.id : null,
    tag: blank(i.tag),
    title: blank(i.title),
    subtitle: blank(i.subtitle),
    body: blank(i.body),
    value: blank(i.value),
    unit: blank(i.unit),
    stat_key: blank(i.stat_key),
    is_active: i.is_active ?? false,
    link_url: blank(i.link_url),
    link_label: blank(i.link_label),
    meta: i.meta ?? null,
  };
}

function sectionToInput(s: SectionAdmin) {
  return {
    type: s.type,
    is_visible: s.is_visible,
    eyebrow: blank(s.eyebrow),
    heading: blank(s.heading),
    subheading: blank(s.subheading),
    body: blank(s.body),
    variant: blank(s.variant),
    background_image_id: s.background_image && "id" in s.background_image ? s.background_image.id : null,
    cta_primary: s.cta_primary ?? null,
    cta_secondary: s.cta_secondary ?? null,
    max_items: s.max_items ?? null,
    source_key: blank(s.source_key),
    settings: s.settings ?? null,
    items: s.items.map(itemToInput),
  };
}

export function toUpdateInput(sections: SectionAdmin[], seo: SeoFormValues): UpdatePageInput {
  return {
    seo: {
      meta_title: blank(seo.metaTitle),
      meta_description: blank(seo.metaDescription),
      canonical_url: blank(seo.canonicalUrl),
      og_image_id: seo.ogImage ?? null,
      og_title: blank(seo.ogTitle),
      og_description: blank(seo.ogDescription),
      noindex: seo.noindex,
    },
    sections: sections.map(sectionToInput),
  };
}

/** A blank section of `type` for the add-menu (admin shape, so it slots into state). */
export function blankSection(type: SectionAdmin["type"]): SectionAdmin {
  return {
    id: `new-${type}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    position: 0,
    is_visible: true,
    eyebrow: null,
    heading: null,
    subheading: null,
    body: null,
    variant: null,
    background_image: null,
    cta_primary: null,
    cta_secondary: null,
    max_items: null,
    source_key: null,
    settings: null,
    items: [],
  } as SectionAdmin;
}

/** A blank item for an items-based section. */
export function blankItem(): SectionItemAdmin {
  return {
    id: `new-item-${Math.random().toString(36).slice(2, 9)}`,
    position: 0,
    icon: null,
    image: null,
    tag: null,
    title: null,
    subtitle: null,
    body: null,
    value: null,
    unit: null,
    stat_key: null,
    is_active: false,
    link_url: null,
    link_label: null,
    meta: null,
  } as SectionItemAdmin;
}

export function seoFromPage(p: PageAdmin): SeoFormValues {
  return seoFromDetail(p.seo);
}
