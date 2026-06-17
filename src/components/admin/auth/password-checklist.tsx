"use client";

import { Check, Circle } from "lucide-react";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_CLASSES,
} from "@/lib/auth/password-policy";
import { cn } from "@/src/lib/utils";

function classesMet(pw: string): number {
  let n = 0;
  if (/[a-z]/.test(pw)) n++;
  if (/[A-Z]/.test(pw)) n++;
  if (/[0-9]/.test(pw)) n++;
  if (/[^a-zA-Z0-9]/.test(pw)) n++;
  return n;
}

/** Mirrors lib/auth/password-policy so the client checklist matches the server rule exactly. */
export function passwordMeetsPolicy(pw: string): boolean {
  return pw.length >= PASSWORD_MIN_LENGTH && classesMet(pw) >= PASSWORD_MIN_CLASSES;
}

/** Live policy checklist (password-reset spec §5) — announced via aria-live as rules are met. */
export function PasswordChecklist({ value }: { value: string }) {
  const rules = [
    {
      ok: value.length >= PASSWORD_MIN_LENGTH,
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    },
    {
      ok: classesMet(value) >= PASSWORD_MIN_CLASSES,
      label: `${PASSWORD_MIN_CLASSES} of: lowercase, uppercase, number, symbol`,
    },
  ];

  return (
    <ul aria-live="polite" className="flex flex-col gap-1.5 text-[13px]">
      {rules.map((rule, i) => (
        <li
          key={i}
          className={cn(
            "flex items-center gap-2",
            rule.ok ? "text-[var(--status-published)]" : "text-muted-foreground",
          )}
        >
          {rule.ok ? (
            <Check className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Circle className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}
