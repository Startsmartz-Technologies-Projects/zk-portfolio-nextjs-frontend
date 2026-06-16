"use client";
import * as React from "react";

// Client island: the news-detail social share rail (+ mobile row). Reads window.location at click
// time and supports copy-to-clipboard. Pure interactivity — no data.

function ShareIc({ k }: { k: "li" | "fb" | "x" | "link" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" };
  const paths: Record<string, string> = {
    li: "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18.3 18h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V18h-2.6V9.7h2.5v1.1h0a2.7 2.7 0 0 1 2.5-1.4c2.6 0 3.1 1.7 3.1 4V18z",
    fb: "M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2h2V2.1C16.5 2 15.5 2 14.5 2 11.8 2 10 3.7 10 6.7V10H7v4h3v8h3z",
    x: "M18 2h3.3l-7.2 8.2L22.5 22h-6.6l-5.2-6.8L4.8 22H1.4l7.7-8.8L1.6 2h6.8l4.7 6.2L18 2zm-1.2 18h1.8L7.3 4h-2l11.5 16z",
    link: "",
  };
  if (k === "link")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d={paths[k]} />
    </svg>
  );
}

function useShare(title: string) {
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState("");
  React.useEffect(() => setUrl(window.location.href), []);
  const copy = () => {
    try {
      navigator.clipboard.writeText(url);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return { url, copied, copy, title };
}

function Buttons({ url, title, copied, copy }: { url: string; title: string; copied: boolean; copy: () => void }) {
  return (
    <>
      <a className="nd-share-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
        <ShareIc k="li" />
      </a>
      <a className="nd-share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
        <ShareIc k="fb" />
      </a>
      <a className="nd-share-btn" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
        <ShareIc k="x" />
      </a>
      <button className={`nd-share-btn ${copied ? "copied" : ""}`} onClick={copy} title="Copy link">
        {copied ? "✓" : <ShareIc k="link" />}
      </button>
    </>
  );
}

export function ShareRail({ title }: { title: string }) {
  const s = useShare(title);
  return (
    <aside className="nd-share-rail">
      <span className="lbl">Share</span>
      <Buttons {...s} />
    </aside>
  );
}

export function ShareMobile({ title }: { title: string }) {
  const s = useShare(title);
  return (
    <div className="nd-share-mobile">
      <Buttons {...s} />
    </div>
  );
}
