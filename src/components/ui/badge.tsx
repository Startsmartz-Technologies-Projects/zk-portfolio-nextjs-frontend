import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

// Status variants map to the foundations §2 palette. Status is never colour-only —
// callers pair the badge with a text label (and an icon where used).
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        draft: "border-transparent bg-[var(--status-draft)] text-[#1d1f1e]",
        published: "border-transparent bg-[var(--status-published)] text-white",
        archived: "border-transparent bg-[var(--status-archived)] text-white",
        danger: "border-transparent bg-[var(--status-danger)] text-white",
        warning: "border-transparent bg-[var(--status-warning)] text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
