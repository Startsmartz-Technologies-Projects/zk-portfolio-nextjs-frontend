"use client";
import * as React from "react";

// Client island: the service-detail sticky section sub-nav (scroll-spy). Pure interactivity over
// in-page anchors — no data. Lifted verbatim from the old client content component so the detail
// page can be a server component (services-fe-public §A).

export function SvcSubnav() {
  const [active, setActive] = React.useState("overview");
  const [isFixed, setIsFixed] = React.useState(false);
  const [navHeight, setNavHeight] = React.useState(92);
  const [subnavTop, setSubnavTop] = React.useState(0);
  const [subnavHeight, setSubnavHeight] = React.useState(0);
  const slotRef = React.useRef<HTMLDivElement | null>(null);
  const barRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const measure = () => {
      const nav = document.querySelector(".nav") as HTMLElement | null;
      const nextNavHeight = nav ? Math.round(nav.getBoundingClientRect().height) : 92;
      const nextTop = slotRef.current ? Math.round(slotRef.current.getBoundingClientRect().top + window.scrollY) : 0;
      const nextHeight = barRef.current?.offsetHeight ?? 0;
      setNavHeight(nextNavHeight);
      setSubnavTop(nextTop);
      setSubnavHeight(nextHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  React.useEffect(() => {
    const onScroll = () => {
      const shouldFix = window.scrollY + navHeight >= subnavTop;
      setIsFixed((prev) => (prev === shouldFix ? prev : shouldFix));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [navHeight, subnavTop]);

  const items = [
    { id: "overview", label: "Overview" },
    { id: "scope", label: "Scope of Work" },
    { id: "process", label: "Execution Process" },
    { id: "benefits", label: "Why Choose Us" },
    { id: "capability", label: "Capability" },
    { id: "faq", label: "FAQ" },
  ];
  return (
    <div ref={slotRef} style={isFixed ? { minHeight: subnavHeight } : undefined}>
      <div ref={barRef} className="svc-subnav" style={isFixed ? { position: "fixed", top: navHeight, left: 0, right: 0, zIndex: 40 } : undefined}>
        <div className="container">
          <div className="svc-subnav-inner flex justify-center">
            {items.map((it) => (
              <a key={it.id} href={`#${it.id}`} onClick={() => setActive(it.id)} className={active === it.id ? "active" : ""}>
                {it.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
