// The public block-document contract (blog/news SRS §8.2; mirrors the renderers
// src/components/blog/block-body.tsx + news/news-body.tsx). The editor's in-memory model
// IS this shape, so the structure round-trips losslessly; rich `text`/`items` carry the
// sanitized bold/link inline HTML.

export interface StatItem {
  big: string;
  label: string;
}

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "quote"; text: string; cite?: string }
  | { kind: "stats"; items: StatItem[] }
  | { kind: "callout"; items: StatItem[] }
  | { kind: "img"; media_id: string | null; caption?: string }
  // Unknown/legacy kinds are preserved (never silently dropped — §13).
  | { kind: string; [key: string]: unknown };

export interface BlogSection {
  id: string;
  heading: string;
  level?: number;
  blocks: Block[];
}

export interface BlogBody {
  sections: BlogSection[];
}

export interface NewsBody {
  blocks: Block[];
}

export type BlockKind = "p" | "h2" | "h3" | "ul" | "quote" | "stats" | "callout" | "img";

export const BLOG_KINDS: BlockKind[] = ["p", "h3", "ul", "quote", "stats", "img"];
export const NEWS_KINDS: BlockKind[] = ["h2", "h3", "p", "ul", "quote", "callout", "img"];

export const KIND_LABEL: Record<string, string> = {
  p: "Paragraph",
  h2: "Heading 2",
  h3: "Heading",
  ul: "Bullet list",
  quote: "Quote",
  stats: "Stats",
  callout: "Callout",
  img: "Image",
};

/** A blank block of the given kind (the empty contract shape). */
export function blankBlock(kind: BlockKind): Block {
  switch (kind) {
    case "p":
    case "h2":
    case "h3":
      return { kind, text: "" };
    case "ul":
      return { kind, items: [""] };
    case "quote":
      return { kind, text: "", cite: "" };
    case "stats":
    case "callout":
      return { kind, items: [{ big: "", label: "" }] };
    case "img":
      return { kind, media_id: null, caption: "" };
  }
}

export function isKnownKind(kind: string, mode: "blog" | "news"): boolean {
  return (mode === "blog" ? BLOG_KINDS : NEWS_KINDS).includes(kind as BlockKind);
}

/** Heading-from-text auto-slug for section anchor ids (ASCII; module rule may transliterate). */
export function slugifyAnchor(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
