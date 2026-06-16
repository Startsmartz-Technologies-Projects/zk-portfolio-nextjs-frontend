"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";

import { resolveMediaAction } from "@/app/admin/media/actions";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useConfirm } from "@/src/components/admin/confirm-dialog";
import { useMediaPicker } from "@/src/components/admin/media/media-picker-provider";
import { RichInline } from "./rich-inline";
import {
  blankBlock,
  isKnownKind,
  slugifyAnchor,
  KIND_LABEL,
  BLOG_KINDS,
  NEWS_KINDS,
  type Block,
  type BlockKind,
  type BlogBody,
  type NewsBody,
  type StatItem,
} from "./types";

let CID = 0;
const cid = () => `bk${++CID}`;

type CBlock = Block & { _cid: string };
type CSection = { _cid: string; id: string; heading: string; level?: number; blocks: CBlock[] };

interface MediaInfo {
  url?: string;
  altPresent: boolean;
  withdrawn: boolean;
}

export interface BlockEditorValue {
  lead: string;
  body: BlogBody | NewsBody;
}

export interface BlockEditorProps {
  mode: "blog" | "news";
  value: BlockEditorValue;
  onChange: (next: BlockEditorValue) => void;
}

function stripCid(b: CBlock): Block {
  const { _cid, ...rest } = b;
  return rest as Block;
}

export function BlockEditor({ mode, value, onChange }: BlockEditorProps) {
  const confirm = useConfirm();
  const pick = useMediaPicker();
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const kinds = mode === "blog" ? BLOG_KINDS : NEWS_KINDS;

  // Deserialize once into a client-id'd working model (structure round-trips losslessly).
  const [lead, setLead] = React.useState(value.lead ?? "");
  const [sections, setSections] = React.useState<CSection[]>(() =>
    mode === "blog"
      ? ((value.body as BlogBody)?.sections ?? []).map((s) => ({
          _cid: cid(),
          id: s.id,
          heading: s.heading,
          level: s.level,
          blocks: (s.blocks ?? []).map((b) => ({ ...b, _cid: cid() })),
        }))
      : [],
  );
  const [blocks, setBlocks] = React.useState<CBlock[]>(() =>
    mode === "news" ? ((value.body as NewsBody)?.blocks ?? []).map((b) => ({ ...b, _cid: cid() })) : [],
  );
  const [media, setMedia] = React.useState<Map<string, MediaInfo>>(new Map());

  // Emit serialized value on any change.
  const serialized = React.useMemo<BlockEditorValue>(() => {
    if (mode === "blog") {
      return {
        lead,
        body: {
          sections: sections.map((s) => ({
            id: s.id,
            heading: s.heading,
            ...(s.level ? { level: s.level } : {}),
            blocks: s.blocks.map(stripCid),
          })),
        },
      };
    }
    return { lead, body: { blocks: blocks.map(stripCid) } };
  }, [mode, lead, sections, blocks]);

  React.useEffect(() => {
    onChangeRef.current(serialized);
  }, [serialized]);

  // Resolve image media_ids → thumbnail + alt status (non-destructive on withdrawn).
  const allBlocks = mode === "blog" ? sections.flatMap((s) => s.blocks) : blocks;
  const imgIds = allBlocks
    .filter((b): b is CBlock & { media_id: string } => b.kind === "img" && typeof b.media_id === "string")
    .map((b) => b.media_id);
  const imgKey = imgIds.join(",");
  React.useEffect(() => {
    const missing = imgIds.filter((id) => !media.has(id));
    if (missing.length === 0) return;
    resolveMediaAction(missing)
      .then((refs) => {
        setMedia((prev) => {
          const next = new Map(prev);
          refs.forEach((r) => {
            if ("withdrawn" in r) next.set(r.id, { altPresent: false, withdrawn: true });
            else if ("alt" in r)
              next.set(r.id, { url: r.url, altPresent: !!r.alt?.trim(), withdrawn: false });
          });
          return next;
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgKey]);

  // ── Block list operations (shared by news flat list + each blog section) ──
  function updateBlockIn(list: CBlock[], cidKey: string, patch: Block): CBlock[] {
    return list.map((b) => (b._cid === cidKey ? { ...patch, _cid: cidKey } : b));
  }
  function moveInList<T>(list: T[], i: number, delta: number): T[] {
    const to = i + delta;
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(i, 1);
    next.splice(to, 0, item);
    return next;
  }

  async function chooseImage(setBlock: (patch: Block) => void) {
    const result = await pick({ resourceType: "image", title: "Choose an image" });
    const picked = result?.[0];
    if (!picked) return;
    setMedia((prev) =>
      new Map(prev).set(picked.id, { url: picked.url, altPresent: picked.alt_present, withdrawn: false }),
    );
    setBlock({ kind: "img", media_id: picked.id, caption: "" });
  }

  async function confirmRemove(hasContent: boolean): Promise<boolean> {
    if (!hasContent) return true;
    return confirm({
      title: "Remove this block?",
      confirmLabel: "Remove",
      destructive: true,
    });
  }

  // Renders one block list (news = the whole body; blog = one section's blocks).
  function BlockList({
    list,
    setList,
  }: {
    list: CBlock[];
    setList: (updater: (prev: CBlock[]) => CBlock[]) => void;
  }) {
    return (
      <div className="flex flex-col gap-2">
        {list.map((block, i) => (
          <BlockCard
            key={block._cid}
            mode={mode}
            block={block}
            index={i}
            total={list.length}
            media={block.kind === "img" && typeof block.media_id === "string" ? media.get(block.media_id) : undefined}
            onUpdate={(patch) => setList((prev) => updateBlockIn(prev, block._cid, patch))}
            onMoveUp={() => setList((prev) => moveInList(prev, i, -1))}
            onMoveDown={() => setList((prev) => moveInList(prev, i, +1))}
            onRemove={async () => {
              const hasContent = blockHasContent(block);
              if (await confirmRemove(hasContent)) {
                setList((prev) => prev.filter((b) => b._cid !== block._cid));
              }
            }}
            onChooseImage={() =>
              chooseImage((patch) => setList((prev) => updateBlockIn(prev, block._cid, patch)))
            }
          />
        ))}
        <InsertMenu
          kinds={kinds}
          onInsert={(kind) => setList((prev) => [...prev, { ...blankBlock(kind), _cid: cid() }])}
          label="Add block"
        />
      </div>
    );
  }

  // ── Blog sections ──────────────────────────────────────────────────────
  if (mode === "blog") {
    return (
      <div className="flex flex-col gap-4">
        <LeadField value={lead} onChange={setLead} />
        {sections.length === 0 ? (
          <EmptyPrompt mode="blog" />
        ) : (
          sections.map((section, si) => (
            <div key={section._cid} className="rounded-[10px] border border-border bg-card p-3">
              <div className="mb-3 flex items-start gap-2">
                <div className="flex flex-col items-center pt-6 text-muted-foreground">
                  <button type="button" aria-label="Move section up" disabled={si === 0} onClick={() => setSections((p) => moveInList(p, si, -1))} className="rounded p-0.5 hover:bg-secondary disabled:opacity-30">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Move section down" disabled={si === sections.length - 1} onClick={() => setSections((p) => moveInList(p, si, +1))} className="rounded p-0.5 hover:bg-secondary disabled:opacity-30">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`sec-h-${section._cid}`}>Section heading</Label>
                    <Input
                      id={`sec-h-${section._cid}`}
                      value={section.heading}
                      onChange={(e) => {
                        const heading = e.target.value;
                        setSections((p) =>
                          p.map((s) =>
                            s._cid === section._cid
                              ? { ...s, heading, id: s.id || slugifyAnchor(heading) }
                              : s,
                          ),
                        );
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`sec-id-${section._cid}`}>Anchor ID</Label>
                    <Input
                      id={`sec-id-${section._cid}`}
                      value={section.id}
                      onChange={(e) =>
                        setSections((p) => p.map((s) => (s._cid === section._cid ? { ...s, id: e.target.value } : s)))
                      }
                      aria-describedby={`sec-id-help-${section._cid}`}
                    />
                    {sections.filter((s) => s.id === section.id).length > 1 && (
                      <p className="text-[12px] text-destructive">Anchor IDs must be unique within the article.</p>
                    )}
                    <p id={`sec-id-help-${section._cid}`} className="text-[12px] text-muted-foreground">
                      Auto-filled from the heading; used for in-page links.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove section"
                  onClick={async () => {
                    const has = section.heading.trim() !== "" || section.blocks.length > 0;
                    if (!has || (await confirm({ title: "Remove this section and its blocks?", confirmLabel: "Remove", destructive: true }))) {
                      setSections((p) => p.filter((s) => s._cid !== section._cid));
                    }
                  }}
                  className="mt-6 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <BlockList
                list={section.blocks}
                setList={(updater) =>
                  setSections((p) => p.map((s) => (s._cid === section._cid ? { ...s, blocks: updater(s.blocks) } : s)))
                }
              />
            </div>
          ))
        )}
        <Button
          type="button"
          variant="outline"
          className="gap-1 self-start"
          onClick={() => setSections((p) => [...p, { _cid: cid(), id: "", heading: "", blocks: [] }])}
        >
          <Plus className="h-4 w-4" /> Add section
        </Button>
      </div>
    );
  }

  // ── News flat body ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <LeadField value={lead} onChange={setLead} />
      {blocks.length === 0 ? <EmptyPrompt mode="news" /> : null}
      <BlockList list={blocks} setList={(updater) => setBlocks((p) => updater(p))} />
    </div>
  );
}

function blockHasContent(b: Block): boolean {
  if (b.kind === "img") return !!(b as { media_id?: string }).media_id;
  if ("text" in b) return !!(b.text as string)?.trim();
  if ("items" in b) return ((b.items as unknown[]) ?? []).length > 0;
  return true;
}

function LeadField({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Lead</Label>
      <RichInline value={value} onChange={onChange} ariaLabel="Body lead" placeholder="The opening paragraph shown before the body." />
    </div>
  );
}

function EmptyPrompt({ mode }: { mode: "blog" | "news" }) {
  return (
    <div className="rounded-[10px] border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
      {mode === "blog" ? "Add your first section." : "Add your first block."}
    </div>
  );
}

function InsertMenu({
  kinds,
  onInsert,
  label,
}: {
  kinds: BlockKind[];
  onInsert: (kind: BlockKind) => void;
  label: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1 self-start text-muted-foreground">
          <Plus className="h-4 w-4" /> {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {kinds.map((k) => (
          <DropdownMenuItem key={k} onSelect={() => onInsert(k)}>
            {KIND_LABEL[k]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BlockCard({
  mode,
  block,
  index,
  total,
  media,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChooseImage,
}: {
  mode: "blog" | "news";
  block: CBlock;
  index: number;
  total: number;
  media?: MediaInfo;
  onUpdate: (patch: Block) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onChooseImage: () => void;
}) {
  const known = isKnownKind(block.kind, mode);
  return (
    <div className={cn("flex items-start gap-2 rounded-md border bg-card p-2", known ? "border-border" : "border-[var(--status-warning)]")}>
      <div className="flex flex-col items-center gap-0.5 pt-1 text-muted-foreground">
        <span className="rounded p-1" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
        <button type="button" aria-label="Move up" disabled={index === 0} onClick={onMoveUp} className="rounded p-0.5 hover:bg-secondary disabled:opacity-30">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Move down" disabled={index === total - 1} onClick={onMoveDown} className="rounded p-0.5 hover:bg-secondary disabled:opacity-30">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {KIND_LABEL[block.kind] ?? `Unsupported (${block.kind})`}
        </div>
        {!known ? (
          <p className="text-[13px] text-muted-foreground">This block type isn&apos;t editable here; it&apos;s preserved on save.</p>
        ) : (
          <BlockBody block={block} media={media} onUpdate={onUpdate} onChooseImage={onChooseImage} />
        )}
      </div>

      <button type="button" aria-label="Remove block" onClick={onRemove} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function BlockBody({
  block,
  media,
  onUpdate,
  onChooseImage,
}: {
  block: CBlock;
  media?: MediaInfo;
  onUpdate: (patch: Block) => void;
  onChooseImage: () => void;
}) {
  switch (block.kind) {
    case "p":
    case "quote":
      return (
        <div className="flex flex-col gap-2">
          <RichInline value={(block as { text?: string }).text ?? ""} onChange={(text) => onUpdate({ ...(block as Block), text } as Block)} />
          {block.kind === "quote" && (
            <Input
              placeholder="Citation (optional)"
              value={(block as { cite?: string }).cite ?? ""}
              onChange={(e) => onUpdate({ kind: "quote", text: (block as { text?: string }).text ?? "", cite: e.target.value })}
            />
          )}
        </div>
      );
    case "h2":
    case "h3":
      return (
        <Input
          value={(block as { text?: string }).text ?? ""}
          placeholder="Heading text"
          onChange={(e) => onUpdate({ kind: block.kind, text: e.target.value } as Block)}
        />
      );
    case "ul":
      return <ListEditor items={(block as { items?: string[] }).items ?? []} onChange={(items) => onUpdate({ kind: "ul", items })} />;
    case "stats":
    case "callout":
      return (
        <StatsEditor
          items={((block as { items?: StatItem[] }).items ?? [])}
          onChange={(items) => onUpdate({ kind: block.kind, items } as Block)}
        />
      );
    case "img":
      return <ImgEditor block={block} media={media} onUpdate={onUpdate} onChoose={onChooseImage} />;
    default:
      return null;
  }
}

function ListEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-1">
          <RichInline value={it} onChange={(html) => onChange(items.map((x, j) => (j === i ? html : x)))} className="flex-1" />
          <button type="button" aria-label="Remove item" onClick={() => onChange(items.filter((_, j) => j !== i))} className="mt-1 rounded p-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="gap-1 self-start" onClick={() => onChange([...items, ""])}>
        <Plus className="h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}

function StatsEditor({ items, onChange }: { items: StatItem[]; onChange: (items: StatItem[]) => void }) {
  const empty = items.some((s) => !s.big?.trim() || !s.label?.trim());
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input placeholder="Number" value={s.big} className="w-28" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, big: e.target.value } : x)))} />
          <Input placeholder="Label" value={s.label} className="flex-1" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <button type="button" aria-label="Remove stat" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {empty && <p className="text-[12px] text-[var(--status-warning)]">Each stat needs a number and a label.</p>}
      <Button type="button" variant="ghost" size="sm" className="gap-1 self-start" onClick={() => onChange([...items, { big: "", label: "" }])}>
        <Plus className="h-3.5 w-3.5" /> Add stat
      </Button>
    </div>
  );
}

function ImgEditor({
  block,
  media,
  onUpdate,
  onChoose,
}: {
  block: CBlock;
  media?: MediaInfo;
  onUpdate: (patch: Block) => void;
  onChoose: () => void;
}) {
  const mediaId = (block as { media_id?: string | null }).media_id ?? null;
  const caption = (block as { caption?: string }).caption ?? "";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary/40">
          {media?.withdrawn ? (
            <span className="px-1 text-center text-[11px] text-[var(--status-warning)]">Image missing</span>
          ) : media?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={onChoose}>
            {mediaId ? "Replace" : "Choose an image"}
          </Button>
          {mediaId && !media?.withdrawn && !media?.altPresent && (
            <span className="text-[12px] text-[var(--status-warning)]">This image needs alt text before publishing.</span>
          )}
          {media?.withdrawn && <span className="text-[12px] text-[var(--status-warning)]">Image missing — replace it.</span>}
        </div>
      </div>
      <Input
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => onUpdate({ kind: "img", media_id: mediaId, caption: e.target.value })}
      />
    </div>
  );
}
