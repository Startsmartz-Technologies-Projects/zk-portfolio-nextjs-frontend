"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ExternalLink, ImageIcon, Loader2, Save, Tags, X } from "lucide-react";

import {
  updateProfileAction,
  updateBrandAction,
  replaceCompanyStatsAction,
  updateSettingAction,
} from "@/app/admin/site/actions";
import { PageHeader } from "@/src/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Field, TabCard, Textarea } from "@/src/components/admin/shared/form-fields";
import { Thumb } from "@/src/components/admin/shared/list-primitives";
import { RepeatableGroup } from "@/src/components/admin/repeatable/repeatable-group";
import { MediaPickerProvider, useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { useToast } from "@/src/components/ui/use-toast";
import {
  SOCIAL_PLATFORMS,
  STAT_UNITS,
  brandSaveBlockers,
  profileFormSchema,
  settingPayload,
  statsFormSchema,
  toBrandInput,
  toProfileForm,
  toProfileInput,
  toStatsForm,
  toStatsInput,
  yearsOfExperience,
  type BrandFormValues,
  type BrandInitial,
  type BrandSlotValue,
  type ProfileFormValues,
  type ProfileInitial,
  type SettingInitial,
  type StatInitial,
  type StatsFormValues,
} from "./settings-form";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "brand", label: "Brand" },
  { id: "contact", label: "Contact" },
  { id: "social", label: "Social" },
  { id: "stats", label: "Stats" },
  { id: "settings", label: "Settings" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const isoOf = (d: unknown): string | null => {
  if (!d) return null;
  try {
    return new Date(d as string).toISOString();
  } catch {
    return null;
  }
};

export interface SettingsEditorProps {
  profile: ProfileInitial | null;
  brand: BrandInitial;
  stats: StatInitial[];
  settings: SettingInitial[];
  canViewAuditLog: boolean;
  initialTab: string;
}

export function SettingsEditor(props: SettingsEditorProps) {
  return (
    <MediaPickerProvider>
      <Inner {...props} />
    </MediaPickerProvider>
  );
}

function Inner({ profile, brand, stats, settings, canViewAuditLog, initialTab }: SettingsEditorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const validTab = (TABS.find((t) => t.id === initialTab)?.id ?? "profile") as Tab;
  const [tab, setTab] = React.useState<Tab>(validTab);
  function onTab(next: string) {
    setTab(next as Tab);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  }

  const [expectedUpdatedAt, setExpectedUpdatedAt] = React.useState<string | null>(profile?.updatedAt ?? null);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingBrand, setSavingBrand] = React.useState(false);
  const [savingStats, setSavingStats] = React.useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toProfileForm(profile),
  });
  const brandForm = useForm<BrandFormValues>({ defaultValues: brand });
  const statsForm = useForm<StatsFormValues>({
    resolver: zodResolver(statsFormSchema),
    defaultValues: toStatsForm(stats),
  });

  const estYear = useWatch({ control: profileForm.control, name: "establishmentYear" });
  const years = yearsOfExperience(typeof estYear === "number" ? estYear : Number(estYear));

  const brandValues = useWatch({ control: brandForm.control }) as BrandFormValues;
  const brandBlockers = brandSaveBlockers(brandValues ?? brand);

  async function saveProfile() {
    if (!(await profileForm.trigger())) {
      toast({ variant: "destructive", title: "Fix the highlighted fields first." });
      return;
    }
    const values = profileForm.getValues();
    setSavingProfile(true);
    try {
      const updated = await updateProfileAction(toProfileInput(values, expectedUpdatedAt));
      setExpectedUpdatedAt(isoOf((updated as { updatedAt?: unknown }).updatedAt));
      profileForm.reset(values);
      toast({ variant: "success", title: "Saved — updating the site." });
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      toast({
        variant: "destructive",
        title: /modif|reload|conflict/i.test(msg)
          ? "Site settings changed elsewhere — reload to continue."
          : "Couldn't save — please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveBrand() {
    const values = brandForm.getValues();
    if (brandSaveBlockers(values).length) {
      toast({ variant: "destructive", title: "Resolve the brand requirements first." });
      return;
    }
    setSavingBrand(true);
    try {
      await updateBrandAction(toBrandInput(values));
      brandForm.reset(values);
      toast({ variant: "success", title: "Saved — updating the site." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't save the brand assets." });
    } finally {
      setSavingBrand(false);
    }
  }

  async function saveStats() {
    if (!(await statsForm.trigger())) {
      toast({ variant: "destructive", title: "Fix the highlighted stat rows first." });
      return;
    }
    const values = statsForm.getValues();
    setSavingStats(true);
    try {
      await replaceCompanyStatsAction(toStatsInput(values));
      statsForm.reset(values);
      toast({ variant: "success", title: "Saved — updating the site." });
    } catch {
      toast({ variant: "destructive", title: "Couldn't save the stats (check for duplicate keys)." });
    } finally {
      setSavingStats(false);
    }
  }

  const pErr = profileForm.formState.errors;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Site Settings"
        breadcrumbs={[{ label: "Site Settings" }]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/site/taxonomy" className="gap-1">
              <Tags className="h-4 w-4" /> Manage taxonomies
            </Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={onTab}>
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile + Contact + Social all write the one CompanyProfile (FR-SITE-001/002). */}
        <FormProvider {...profileForm}>
          <TabsContent value="profile" forceMount>
            <TabCard>
              <Field label="Company name" htmlFor="name" error={pErr.name?.message}>
                <Input id="name" {...profileForm.register("name")} />
              </Field>
              <Field label="Legal name" htmlFor="legalName">
                <Input id="legalName" {...profileForm.register("legalName")} />
              </Field>
              <Field label="Tagline" htmlFor="tagline" helper="Short slogan shown in the footer under the logo.">
                <Input id="tagline" {...profileForm.register("tagline")} />
              </Field>
              <Field label="Brand description" htmlFor="brandDescription" helper="Shown in the chrome / about; Bangla allowed.">
                <Textarea id="brandDescription" rows={3} {...profileForm.register("brandDescription")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Establishment year"
                  htmlFor="establishmentYear"
                  error={pErr.establishmentYear?.message}
                  helper={years ? `Derived: ${years} years of experience (not stored).` : undefined}
                >
                  <Input id="establishmentYear" type="number" {...profileForm.register("establishmentYear", { valueAsNumber: true })} />
                </Field>
                <Field label="Copyright text" htmlFor="copyrightText" error={pErr.copyrightText?.message}>
                  <Input id="copyrightText" {...profileForm.register("copyrightText")} />
                </Field>
              </div>
              <p className="rounded-md border border-dashed border-border bg-card/50 p-3 text-[12px] text-muted-foreground">
                Years of experience, project count, and districts covered are computed by the public site — don&apos;t add them here.
              </p>
              <SaveBar saving={savingProfile} onSave={saveProfile} />
            </TabCard>
          </TabsContent>

          <TabsContent value="contact" forceMount>
            <TabCard>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" error={pErr.email?.message}>
                  <Input id="email" type="email" {...profileForm.register("email")} />
                </Field>
                <Field label="Phone" htmlFor="phone" error={pErr.phone?.message} helper="International format, e.g. +8801791026074.">
                  <Input id="phone" {...profileForm.register("phone")} />
                </Field>
              </div>
              <Field label="WhatsApp" htmlFor="whatsapp" error={pErr.whatsapp?.message} helper="Full WhatsApp link (https://wa.me/…). Powers the WhatsApp buttons on Let's Collaborate.">
                <Input id="whatsapp" {...profileForm.register("whatsapp")} />
              </Field>
              <Field label="Office address" htmlFor="officeAddress" error={pErr.officeAddress?.message} helper="Bangla allowed.">
                <Textarea id="officeAddress" rows={2} {...profileForm.register("officeAddress")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business hours" htmlFor="businessHours" helper="Shown on the Let's Collaborate contact card.">
                  <Input id="businessHours" {...profileForm.register("businessHours")} />
                </Field>
                <Field label="Coverage summary" htmlFor="coverageSummary" helper="Shown on the Let's Collaborate hero card.">
                  <Input id="coverageSummary" {...profileForm.register("coverageSummary")} />
                </Field>
              </div>
              <SaveBar saving={savingProfile} onSave={saveProfile} />
            </TabCard>
          </TabsContent>

          <TabsContent value="social" forceMount>
            <TabCard>
              <RepeatableGroup
                name="socials"
                label="Social links"
                itemNoun="social link"
                addLabel="Add social link"
                emptyHint="Add the first social profile."
                newRow={() => ({ platform: "facebook", url: "" })}
                summary={(r) => (r.url as string) || (r.platform as string) || "Social link"}
                renderRow={({ index }) => (
                  <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                    <Field label="Platform" htmlFor={`socials.${index}.platform`}>
                      <select
                        id={`socials.${index}.platform`}
                        {...profileForm.register(`socials.${index}.platform` as const)}
                        className="h-9 rounded-md border border-input bg-card px-3 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {SOCIAL_PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="URL" htmlFor={`socials.${index}.url`} error={pErr.socials?.[index]?.url?.message}>
                      <Input id={`socials.${index}.url`} placeholder="https://…" {...profileForm.register(`socials.${index}.url` as const)} />
                    </Field>
                  </div>
                )}
              />
              <SaveBar saving={savingProfile} onSave={saveProfile} />
            </TabCard>
          </TabsContent>
        </FormProvider>

        {/* Brand assets (FR-SITE-005/007). */}
        <FormProvider {...brandForm}>
          <TabsContent value="brand" forceMount>
            <TabCard>
              <BrandSlot name="logo_primary" label="Primary logo" helper="Used in the site navigation." requireAlt />
              <BrandSlot name="logo_footer" label="Footer logo" helper="Used in the site footer." requireAlt />
              <BrandSlot name="favicon" label="Favicon" helper="Browser tab icon." />
              <BrandSlot name="og_default" label="Default social image" helper="Default social-share (OG) image." />
              {brandBlockers.length > 0 && (
                <ul className="flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[12px] text-destructive">
                  {brandBlockers.map((b) => (
                    <li key={b} className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> {b}
                    </li>
                  ))}
                </ul>
              )}
              <SaveBar saving={savingBrand} onSave={saveBrand} disabled={brandBlockers.length > 0} />
            </TabCard>
          </TabsContent>
        </FormProvider>

        {/* Company stats (FR-SITE-008). */}
        <FormProvider {...statsForm}>
          <TabsContent value="stats" forceMount>
            <TabCard>
              <RepeatableGroup
                name="stats"
                label="Company stats"
                itemNoun="stat"
                addLabel="Add stat"
                emptyHint="Add the first KPI."
                newRow={() => ({ key: "", label: "", value: "", unit: "" })}
                summary={(r) => (r.label as string) || (r.key as string) || "Stat"}
                renderRow={({ index }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Key" htmlFor={`stats.${index}.key`} helper="Stable, slug-like, unique.">
                      <Input id={`stats.${index}.key`} {...statsForm.register(`stats.${index}.key` as const)} />
                    </Field>
                    <Field label="Label" htmlFor={`stats.${index}.label`}>
                      <Input id={`stats.${index}.label`} {...statsForm.register(`stats.${index}.label` as const)} />
                    </Field>
                    <Field label="Value" htmlFor={`stats.${index}.value`}>
                      <Input id={`stats.${index}.value`} {...statsForm.register(`stats.${index}.value` as const)} />
                    </Field>
                    <Field label="Unit" htmlFor={`stats.${index}.unit`}>
                      <select
                        id={`stats.${index}.unit`}
                        {...statsForm.register(`stats.${index}.unit` as const)}
                        className="h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {STAT_UNITS.map((u) => (
                          <option key={u || "none"} value={u}>
                            {u || "none"}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}
              />
              <p className="text-[12px] text-muted-foreground">
                Derived metrics (years of experience, project count, districts covered) are computed elsewhere — don&apos;t add them here.
              </p>
              <SaveBar saving={savingStats} onSave={saveStats} />
            </TabCard>
          </TabsContent>
        </FormProvider>

        {/* Typed global settings (FR-SITE-016/017/018) — each row saves on its own. */}
        <TabsContent value="settings" forceMount>
          <TabCard>
            {settings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No settings defined.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {settings.map((s) => (
                  <SettingRow key={s.key} setting={s} />
                ))}
              </ul>
            )}
          </TabCard>
        </TabsContent>
      </Tabs>

      {canViewAuditLog && (
        <Link href="/admin/audit" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline">
          <ExternalLink className="h-3.5 w-3.5" /> View audit log
        </Link>
      )}
    </div>
  );
}

function SaveBar({ saving, onSave, disabled }: { saving: boolean; onSave: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border pt-4" aria-live="polite">
      <Button onClick={onSave} disabled={saving || disabled} className="gap-1.5">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function BrandSlot({
  name,
  label,
  helper,
  requireAlt,
}: {
  name: keyof BrandFormValues;
  label: string;
  helper?: string;
  requireAlt?: boolean;
}) {
  const { watch, setValue } = useFormContext<BrandFormValues>();
  const pick = useMediaPicker();
  const value = watch(name) as BrandSlotValue | null;

  async function choose() {
    const r = await pick({ resourceType: "image", title: `Choose ${label.toLowerCase()}` });
    if (r && r[0]) {
      const ref = r[0].ref;
      const alt = ref && "alt" in ref ? ((ref as { alt: string | null }).alt ?? null) : null;
      setValue(name, { id: r[0].id, url: r[0].url, alt, altPresent: r[0].alt_present }, { shouldDirty: true });
    }
  }

  const missingAlt = Boolean(requireAlt && value && !value.altPresent);

  return (
    <Field label={label} helper={helper} error={missingAlt ? "This logo needs alt text before it can be saved." : undefined}>
      <div className="flex flex-wrap items-center gap-3">
        <Thumb
          media={value ? { id: value.id, url: value.url, alt: value.alt, width: null, height: null } : null}
          alt=""
          className="h-16 w-24"
        />
        <Button type="button" variant="outline" size="sm" onClick={choose} className="gap-1">
          <ImageIcon className="h-4 w-4" /> {value ? "Replace" : "Choose"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setValue(name, null, { shouldDirty: true })} aria-label={`Remove ${label}`}>
            <X className="h-4 w-4" />
          </Button>
        )}
        {requireAlt && value && (
          <span className={missingAlt ? "inline-flex items-center gap-1 text-[12px] text-destructive" : "text-[12px] text-muted-foreground"}>
            {missingAlt ? <><AlertTriangle className="h-3.5 w-3.5" /> No alt text</> : "Alt text ✓"}
          </span>
        )}
      </div>
    </Field>
  );
}

function SettingRow({ setting }: { setting: SettingInitial }) {
  const { toast } = useToast();
  const [val, setVal] = React.useState<string | boolean>(setting.type === "bool" ? setting.value === "true" : setting.value);
  const [saved, setSaved] = React.useState(setting.value);
  const [saving, setSaving] = React.useState(false);

  const encoded = setting.type === "bool" ? (val ? "true" : "false") : String(val);
  const dirty = encoded !== saved;

  async function save() {
    setSaving(true);
    try {
      const result = await updateSettingAction(setting.key, settingPayload(setting.type, val));
      setSaved((result as { value?: string }).value ?? encoded);
      toast({ variant: "success", title: `Saved '${setting.key}'.` });
    } catch {
      toast({ variant: "destructive", title: `Couldn't save '${setting.key}' — check the value.` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-wrap items-end gap-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <code className="text-sm font-medium text-foreground">{setting.key}</code>
          <Badge variant={setting.isPublic ? "primary" : "outline"}>{setting.isPublic ? "Public" : "Admin-only"}</Badge>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{setting.type}</span>
        </div>
        <div className="max-w-sm">
          {setting.type === "bool" ? (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={val as boolean}
                onChange={(e) => setVal(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              {val ? "Enabled" : "Disabled"}
            </label>
          ) : setting.type === "json" ? (
            <Textarea rows={3} value={val as string} onChange={(e) => setVal(e.target.value)} className="font-mono text-xs" />
          ) : (
            <Input
              type={setting.type === "int" ? "number" : "text"}
              value={val as string}
              onChange={(e) => setVal(e.target.value)}
            />
          )}
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={save} disabled={saving || !dirty} className="gap-1.5">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save
      </Button>
    </li>
  );
}
