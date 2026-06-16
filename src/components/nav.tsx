"use client";

import * as React from "react";
import { Nav as LegacyNav } from "./sections1";
import type { SiteChrome } from "@/src/lib/site/chrome";

export function Nav({ site }: { site: SiteChrome }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <LegacyNav scrolled={scrolled} site={site} />;
}
