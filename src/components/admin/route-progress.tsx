"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * A thin top progress bar that pulses on route transitions (app-shell §6 saving/optimistic).
 * Lightweight: it animates whenever the resolved pathname changes. Fixed to the very top
 * of the viewport, above the shell chrome.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden"
    >
      <div
        className={
          "h-full bg-primary transition-all duration-500 ease-out " +
          (visible ? "w-full opacity-100" : "w-0 opacity-0")
        }
      />
    </div>
  );
}
