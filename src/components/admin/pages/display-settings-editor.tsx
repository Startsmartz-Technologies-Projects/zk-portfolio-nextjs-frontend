"use client";

import * as React from "react";

import { Input } from "@/src/components/ui/input";
import { Field, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import type { SectionAdmin, SectionType } from "./types";

// Editor for the section `settings` JSON — the display-only fields the public renderer
// reads straight from `settings` (section-renderer.tsx): hero ticker/bottom/accent + the
// green `stamp` badge, about_intro `overlay` card + accent, story `badge`, and the
// leadership `quote`/`signature`. None of these have a first-class chrome/item input, so
// without this panel they're only editable by hand-editing the DB. `settings` round-trips
// untouched through page-form.ts (sectionToInput → settings: s.settings), so patching it
// here persists on Save with no other wiring.

// Which section types expose a Display settings panel (and what's inside it).
const SETTINGS_SECTION_TYPES: SectionType[] = ["hero", "about_intro", "story", "leadership_message"];

export function hasDisplaySettings(type: SectionType): boolean {
  return SETTINGS_SECTION_TYPES.includes(type);
}

// ── settings read/write helpers ──────────────────────────────────────────────
// `settings` is stored as an opaque JSON object; treat a non-object as empty.
type Settings = Record<string, unknown>;
const asObj = (v: unknown): Settings => (v && typeof v === "object" && !Array.isArray(v) ? { ...(v as Settings) } : {});

/** A `{ value, unit, label }` stat-card sub-object (used by hero `stamp` and about `overlay`). */
type StatCard = { value?: string; unit?: string; label?: string };
const asStatCard = (v: unknown): StatCard => (v && typeof v === "object" ? (v as StatCard) : {});

/**
 * A hero with a `stamp` renders as the split layout (AboutHero) instead of the full-bleed
 * hero — and the split layout draws NO items and no ticker/bottom strip. Callers use this to
 * hide editors for fields that wouldn't render in the current hero mode.
 */
export function isSplitLayoutHero(section: SectionAdmin): boolean {
  if (section.type !== "hero") return false;
  const stamp = asStatCard(asObj(section.settings).stamp);
  return Boolean(stamp.value || stamp.unit || stamp.label);
}
/** A `{ name, role }` signature sub-object (leadership_message). */
type Signature = { name?: string; role?: string };
const asSignature = (v: unknown): Signature => (v && typeof v === "object" ? (v as Signature) : {});

const blankToUndef = (s: string): string | undefined => {
  const t = s.trim();
  return t ? t : undefined;
};

/** Drop a top-level settings key, or null the whole object once it's empty (matches the
 *  renderer's "absent → not rendered" guards and keeps the stored JSON tidy). */
function withoutKey(settings: Settings, key: string): Settings | null {
  const next = { ...settings };
  delete next[key];
  return Object.keys(next).length ? next : null;
}

/** Set a top-level scalar key (empty string clears it). */
function setScalar(settings: Settings, key: string, raw: string): Settings | null {
  const value = blankToUndef(raw);
  if (value === undefined) return withoutKey(settings, key);
  return { ...settings, [key]: value };
}

/** Patch one field of a nested object key, dropping the whole key when it ends up empty. */
function setNested(settings: Settings, key: string, field: string, raw: string): Settings | null {
  const current = asObj(settings[key]);
  const value = blankToUndef(raw);
  if (value === undefined) delete current[field];
  else current[field] = value;
  if (Object.keys(current).length === 0) return withoutKey(settings, key);
  return { ...settings, [key]: current };
}

// ── component ─────────────────────────────────────────────────────────────────
export function DisplaySettingsEditor({
  section,
  onChange,
}: {
  section: SectionAdmin;
  onChange: (patch: Partial<SectionAdmin>) => void;
}) {
  const settings = asObj(section.settings);
  // `settings` is opaque JSON (Prisma JsonValue; validated as z.unknown()). Cast at this
  // boundary so the plain object we build slots into the section's settings field.
  const set = (next: Settings | null) => onChange({ settings: next as SectionAdmin["settings"] });

  return (
    <TabCard>
      <div>
        <h3 className="font-heading text-sm font-semibold">Display settings</h3>
        <p className="text-[12px] text-muted-foreground">
          Decorative pieces drawn from the layout (badges, accents, captions). Clear a card&apos;s fields to hide it.
        </p>
      </div>

      {section.type === "hero" && <HeroSettings settings={settings} set={set} />}
      {section.type === "about_intro" && <AboutIntroSettings settings={settings} set={set} />}
      {section.type === "story" && <StorySettings settings={settings} set={set} />}
      {section.type === "leadership_message" && <LeadershipSettings settings={settings} set={set} />}
    </TabCard>
  );
}

// A `{ value, unit, label }` card editor (the green stamp / the about overlay).
function StatCardFields({
  prefix,
  card,
  onField,
  helper,
}: {
  prefix: string;
  card: StatCard;
  onField: (field: "value" | "unit" | "label", raw: string) => void;
  helper: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Number" htmlFor={`${prefix}-value`} helper={helper}>
          <Input id={`${prefix}-value`} value={card.value ?? ""} onChange={(e) => onField("value", e.target.value)} placeholder="15" />
        </Field>
        <Field label="Unit" htmlFor={`${prefix}-unit`} helper="Suffix after the number, e.g. + or %.">
          <Input id={`${prefix}-unit`} value={card.unit ?? ""} onChange={(e) => onField("unit", e.target.value)} placeholder="+" />
        </Field>
      </div>
      <Field label="Label" htmlFor={`${prefix}-label`} helper="Caption under the number.">
        <Input id={`${prefix}-label`} value={card.label ?? ""} onChange={(e) => onField("label", e.target.value)} placeholder="Years of Engineering" />
      </Field>
    </div>
  );
}

function HeroSettings({ settings, set }: { settings: Settings; set: (s: Settings | null) => void }) {
  const stamp = asStatCard(settings.stamp);
  // The renderer (section-renderer.tsx HeroSection) splits a hero into two layouts by a single
  // switch: a `stamp` makes it the light split "AboutHero" (stamp + image caption render; ticker
  // /bottom do NOT), otherwise it's the full-bleed dark hero (ticker/bottom render; stamp/caption
  // do NOT). Accent applies to both. So show only the fields that actually render in the current
  // mode — otherwise an editor sees inputs that silently do nothing on the live page.
  const hasStamp = Boolean(stamp.value || stamp.unit || stamp.label);

  return (
    <>
      <div className="flex flex-col gap-2 rounded-md border border-border bg-card/50 p-3">
        <p className="text-[13px] font-medium">Stat badge</p>
        <p className="text-[12px] text-muted-foreground">
          The highlighted card over the hero image (e.g. the green &ldquo;15+&rdquo;). Filling this switches the hero to the
          split layout; clear all three to switch to the full-bleed layout (side ticker + bottom strip).
        </p>
        <StatCardFields prefix="hero-stamp" card={stamp} helper="The big number on the badge." onField={(f, v) => set(setNested(settings, "stamp", f, v))} />
      </div>

      <Field label="Accent phrase" htmlFor="hero-accent" helper="A phrase inside the heading shown in the brand accent colour. Must match the heading text exactly.">
        <Input id="hero-accent" value={(settings.accent as string) ?? ""} onChange={(e) => set(setScalar(settings, "accent", e.target.value))} />
      </Field>

      {hasStamp ? (
        // Split (AboutHero) layout — only the image caption renders alongside the stamp.
        <Field label="Image caption" htmlFor="hero-tag" helper="Caption shown on the hero image (split-layout hero).">
          <Input id="hero-tag" value={(settings.tag as string) ?? ""} onChange={(e) => set(setScalar(settings, "tag", e.target.value))} />
        </Field>
      ) : (
        // Full-bleed layout — side ticker + bottom strip render here only.
        <>
          <Field label="Side ticker" htmlFor="hero-ticker" helper="Rotated label down the side of the full-bleed hero.">
            <Input id="hero-ticker" value={(settings.ticker as string) ?? ""} onChange={(e) => set(setScalar(settings, "ticker", e.target.value))} />
          </Field>
          <Field label="Bottom strip" htmlFor="hero-bottom" helper="Text along the bottom of the full-bleed hero (e.g. location).">
            <Input id="hero-bottom" value={(settings.bottom as string) ?? ""} onChange={(e) => set(setScalar(settings, "bottom", e.target.value))} />
          </Field>
        </>
      )}
    </>
  );
}

function AboutIntroSettings({ settings, set }: { settings: Settings; set: (s: Settings | null) => void }) {
  const overlay = asStatCard(settings.overlay);
  return (
    <>
      <div className="flex flex-col gap-2 rounded-md border border-border bg-card/50 p-3">
        <p className="text-[13px] font-medium">Overlay stat card</p>
        <p className="text-[12px] text-muted-foreground">The card over the section image (e.g. &ldquo;15+ Years delivering…&rdquo;). Clear all three to hide it.</p>
        <StatCardFields prefix="about-overlay" card={overlay} helper="The big number on the card." onField={(f, v) => set(setNested(settings, "overlay", f, v))} />
      </div>
      <Field label="Accent phrase" htmlFor="about-accent" helper="A phrase inside the heading shown in gold italic. Must match the heading text exactly.">
        <Input id="about-accent" value={(settings.accent as string) ?? ""} onChange={(e) => set(setScalar(settings, "accent", e.target.value))} />
      </Field>
    </>
  );
}

function StorySettings({ settings, set }: { settings: Settings; set: (s: Settings | null) => void }) {
  return (
    <Field label="Collage badge" htmlFor="story-badge" helper="Small badge over the image collage (e.g. &ldquo;Since 2010&rdquo;).">
      <Input id="story-badge" value={(settings.badge as string) ?? ""} onChange={(e) => set(setScalar(settings, "badge", e.target.value))} />
    </Field>
  );
}

function LeadershipSettings({ settings, set }: { settings: Settings; set: (s: Settings | null) => void }) {
  const sig = asSignature(settings.signature);
  return (
    <>
      <Field label="Pulled quote" htmlFor="leader-quote" helper="The highlighted blockquote in the message.">
        <Textarea id="leader-quote" rows={3} value={(settings.quote as string) ?? ""} onChange={(e) => set(setScalar(settings, "quote", e.target.value))} />
      </Field>
      <div className="flex flex-col gap-2 rounded-md border border-border bg-card/50 p-3">
        <p className="text-[13px] font-medium">Signature</p>
        <p className="text-[12px] text-muted-foreground">Name + role on the portrait card and the sign-off line. Clear both to hide.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor="leader-sig-name">
            <Input id="leader-sig-name" value={sig.name ?? ""} onChange={(e) => set(setNested(settings, "signature", "name", e.target.value))} />
          </Field>
          <Field label="Role" htmlFor="leader-sig-role">
            <Input id="leader-sig-role" value={sig.role ?? ""} onChange={(e) => set(setNested(settings, "signature", "role", e.target.value))} />
          </Field>
        </div>
      </div>
    </>
  );
}
