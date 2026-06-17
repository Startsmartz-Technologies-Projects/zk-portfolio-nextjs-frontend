import Link from "next/link";
import { Arrow } from "../site-ui";
import { MediaImage } from "../media/media-image";
import type { MediaRef } from "@/lib/data/media";

// Server-rendered blog article card, shared by the index grid + the detail "related" rail
// (blog-fe-public §A/§E). Cover via <MediaImage>; meta from the derived display_date/read_time.

export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: { label: string } | null;
  cover_image: MediaRef | null;
  display_date: string | null;
  read_time: string;
  author_name: string | null;
};

export function blogInitials(name: string | null) {
  if (!name) return "ZE";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter((c) => /[A-Z]/i.test(c ?? ""))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BlogCard({ item, lime = false, showAuthor = true }: { item: BlogCardData; lime?: boolean; showAuthor?: boolean }) {
  return (
    <Link href={`/blogs/${item.slug}`} className="blog-card" style={{ textDecoration: "none" }}>
      <div className="blog-card-img">
        <MediaImage media={item.cover_image} fill sizes="(max-width: 768px) 100vw, 33vw" />
        {item.category && <span className={`blog-card-cat ${lime ? "lime" : ""}`}>{item.category.label}</span>}
      </div>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          {item.display_date && <span>{item.display_date}</span>}
          <span className="dot" />
          <span>{item.read_time}</span>
        </div>
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
        {showAuthor && (
          <div className="blog-card-foot">
            <div className="blog-card-author">
              <div className="av">{blogInitials(item.author_name)}</div>
              <span>{item.author_name}</span>
            </div>
            <span className="blog-card-more">
              Read More <Arrow size={12} />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
