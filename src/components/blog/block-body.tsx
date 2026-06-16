import { MediaImage } from "../media/media-image";
import type { MediaRef } from "@/lib/data/media";

// Server-side renderer for the Blog/News block-document body (blog-fe-public §E / FR-BLOG-021).
// The published read returns sections of typed blocks; `img` blocks arrive with their `media_id`
// already resolved to a `media` MediaRef (resolveBodyImages), rendered through <MediaImage>.
// Tolerant of the documented block kinds (p/text, h3/heading, ul, quote, stats, img).

type StatItem = { big?: string; label?: string; lbl?: string };
type Block = {
  kind: string;
  text?: string;
  heading?: string;
  cite?: string;
  caption?: string;
  cap?: string;
  url?: string;
  media?: MediaRef | null;
  items?: unknown[];
};
type Section = { id: string; heading: string; level?: number; blocks: Block[] };
export type BlockBody = { sections?: Section[] } | null | undefined;

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "p":
          case "text":
            return <p key={i}>{b.text}</p>;
          case "h3":
          case "heading":
            return <h3 key={i}>{b.heading ?? b.text}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {(b.items ?? []).map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: String(it) }} />
                ))}
              </ul>
            );
          case "quote":
            return (
              <div key={i} className="bd-pullquote">
                <blockquote>{b.text}</blockquote>
                {b.cite && <cite>- {b.cite}</cite>}
              </div>
            );
          case "stats":
            return (
              <div key={i} className="bd-data-card">
                {((b.items as StatItem[]) ?? []).map((s, j) => (
                  <div key={j} className="stat">
                    <div className="big">{s.big}</div>
                    <div className="lbl">{s.label ?? s.lbl}</div>
                  </div>
                ))}
              </div>
            );
          case "img":
            return (
              <div key={i} className="bd-inline-img">
                <div className="frame">
                  <MediaImage media={b.media} fill sizes="(max-width: 980px) 100vw, 720px" />
                </div>
                {(b.caption ?? b.cap) && <div className="cap">{b.caption ?? b.cap}</div>}
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export function BlockBody({ body, lead }: { body: BlockBody; lead?: string | null }) {
  const sections = body?.sections ?? [];
  return (
    <>
      {lead && <p className="lead">{lead}</p>}
      {sections.map((s) => (
        <section key={s.id} id={s.id}>
          <h2>{s.heading}</h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}
    </>
  );
}
