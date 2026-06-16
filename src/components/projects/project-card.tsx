import Link from "next/link";
import { Arrow } from "../site-ui";
import { MediaImage } from "../media/media-image";
import { isImageRef } from "@/src/lib/media/ref";
import type { MediaRef } from "@/lib/data/media";

// Server-rendered project list/grid card (projects-fe-public §A/§D/§E). Shared by the listing
// grid, the featured strip slides, and the detail page's "related" rail so the card markup +
// Cloudinary image handling stay in one place. Pure presentational; takes a serialized
// ProjectListItem subset.

export type ProjectCardData = {
  slug: string;
  title: string;
  summary: string | null;
  category: { label: string } | null;
  location: { label: string } | null;
  location_detail: string | null;
  delivery_status: string;
  year: number | null;
  cover_image: MediaRef | null;
  badge_text: string | null;
  badge_style: string | null;
};

/** badge_style ('default'|'lime'|'black'|'gold') → the legacy badge CSS modifier class. */
export function badgeClass(style: string | null): string {
  return style && style !== "default" ? style : "";
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <path d="M12 2 C8 2 5 5 5 9 c0 5 7 13 7 13 s7-8 7-13 c0-4-3-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function ProjectCard({ p }: { p: ProjectCardData }) {
  const locationText = p.location_detail || p.location?.label || "";
  return (
    <Link href={`/projects/${p.slug}`} className="proj-card" style={{ textDecoration: "none" }}>
      <div className="pc-img-wrap">
        <div className="pc-img">
          <MediaImage media={p.cover_image} fill sizes="(max-width: 720px) 100vw, 25vw" />
        </div>
        {p.badge_text && <span className={`pc-badge ${badgeClass(p.badge_style)}`}>{p.badge_text}</span>}
        {p.year != null && <span className="pc-year">{p.year}</span>}
      </div>
      <div className="pc-body">
        {p.category && <div className="pc-cat">{p.category.label}</div>}
        <h3>{p.title}</h3>
        {locationText && (
          <div className="pc-loc">
            <PinIcon /> {locationText}
          </div>
        )}
        {p.summary && <p className="pc-sum">{p.summary}</p>}
        <div className="pc-footer">
          <span className={`pc-status ${p.delivery_status.toLowerCase()}`}>{p.delivery_status}</span>
          <span className="pc-link">
            View Project{" "}
            <span className="arrow">
              <Arrow size={12} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Extract the displayable image URL from a MediaRef (image branch only), else null. */
export function imageUrlOf(media: MediaRef | null | undefined): string | null {
  return isImageRef(media) ? media.url : null;
}
