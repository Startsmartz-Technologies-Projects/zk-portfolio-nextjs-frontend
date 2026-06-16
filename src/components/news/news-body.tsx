import { MediaImage } from "../media/media-image";
import type { MediaRef } from "@/lib/data/media";

// Server-side renderer for the News flat block-document body (news-fe-public §C / FR-NEWS-021).
// Unlike Blog (sectioned), News bodies are a flat block list: { blocks: [...] }. `img` blocks
// arrive with media_id resolved to a `media` MediaRef (resolveBodyImages). Kinds: h2/h3/p/ul/
// quote/callout/img.

type CalloutStat = { big?: string; label?: string; lbl?: string };
type Block = {
  kind: string;
  text?: string;
  cite?: string;
  caption?: string;
  cap?: string;
  media?: MediaRef | null;
  items?: unknown[];
};
export type NewsBody = { blocks?: Block[] } | null | undefined;

export function NewsBody({ body, lead }: { body: NewsBody; lead?: string | null }) {
  const blocks = body?.blocks ?? [];
  return (
    <>
      {lead && <p className="lead">{lead}</p>}
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "p":
            return <p key={i}>{b.text}</p>;
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
              <div key={i} className="nd-quote">
                <blockquote>
                  {b.text}
                  {b.cite && <cite>{b.cite}</cite>}
                </blockquote>
              </div>
            );
          case "callout":
            return (
              <div key={i} className="nd-callout">
                {((b.items as CalloutStat[]) ?? []).map((st, j) => (
                  <div key={j} className="stat">
                    <div className="big">{st.big}</div>
                    <div className="lbl">{st.label ?? st.lbl}</div>
                  </div>
                ))}
              </div>
            );
          case "img":
            return (
              <div key={i} className="nd-inline-img">
                <div className="frame" style={{ position: "relative" }}>
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
