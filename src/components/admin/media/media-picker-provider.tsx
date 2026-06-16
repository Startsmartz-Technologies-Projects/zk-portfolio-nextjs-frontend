"use client";

import * as React from "react";

import { MediaPicker } from "./media-picker";
import type { ConfirmedMedia, MediaPickerOptions } from "./types";

type OpenMediaPicker = (
  opts?: MediaPickerOptions,
) => Promise<ConfirmedMedia[] | null>;

const Ctx = React.createContext<OpenMediaPicker | null>(null);

/**
 * Promise-based access to the shared Media picker. A host field calls
 * `const pick = useMediaPicker(); const result = await pick({ resourceType: "image" });`
 * — resolves to the confirmed `MediaRef`s + `alt_present`, or `null` on cancel.
 * Wrap the editor subtree in <MediaPickerProvider> (Wave 2 editors / the SEO sidebar host).
 */
export function useMediaPicker(): OpenMediaPicker {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useMediaPicker must be used within <MediaPickerProvider>");
  return ctx;
}

export function MediaPickerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<MediaPickerOptions>({});
  const resolver = React.useRef<((v: ConfirmedMedia[] | null) => void) | null>(null);

  const openPicker = React.useCallback<OpenMediaPicker>((options = {}) => {
    setOpts(options);
    setOpen(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function settle(value: ConfirmedMedia[] | null) {
    resolver.current?.(value);
    resolver.current = null;
  }

  return (
    <Ctx.Provider value={openPicker}>
      {children}
      <MediaPicker
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) settle(null); // closed without confirming → cancel
        }}
        resourceType={opts.resourceType}
        multiple={opts.multiple}
        title={opts.title}
        onConfirm={(selected) => settle(selected)}
      />
    </Ctx.Provider>
  );
}
