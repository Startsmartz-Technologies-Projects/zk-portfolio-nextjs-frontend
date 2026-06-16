import Link from "next/link";
import { Arrow } from "../site-ui";
import { MediaImage } from "../media/media-image";
import type { MediaRef } from "@/lib/data/media";

// Server-rendered news story card, shared by the index grid + the detail "related" rail
// (news-fe-public §A/§E). Cover via <MediaImage>; meta from derived display_date/read_time.

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: { label: string } | null;
  cover_image: MediaRef | null;
  display_date: string | null;
  read_time: string;
};

export function NewsCard({ item, lime = false }: { item: NewsCardData; lime?: boolean }) {
  return (
    <Link href={`/news/${item.slug}`} className="news-card" style={{ textDecoration: "none" }}>
      <div className="news-card-img">
        <MediaImage media={item.cover_image} fill sizes="(max-width: 768px) 100vw, 33vw" />
        {item.category && <span className={`news-card-cat ${lime ? "lime" : ""}`}>{item.category.label}</span>}
      </div>
      <div className="news-card-body">
        <div className="news-card-meta">
          {item.display_date && <span>{item.display_date}</span>}
          <span className="dot" />
          <span>{item.read_time}</span>
        </div>
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
        <span className="news-card-more">
          Read Article <Arrow size={12} />
        </span>
      </div>
    </Link>
  );
}
