"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold as BoldIcon, Link2, Link2Off } from "lucide-react";

import { cn } from "@/src/lib/utils";

// Inline rich text constrained to the contract's marks — **bold + link only** (BR-7).
// All block nodes, headings, lists, and other marks are disabled, so no UI path (typing,
// paste, deserialize) can produce a mark outside the §8.2 set. Stores/loads inline HTML
// (the `<p>` wrapper is stripped) so it matches the block-document `text`/`items` fields.

function stripWrapper(html: string): string {
  return html
    .replace(/<\/p>\s*<p>/gi, "<br>")
    .replace(/^<p>/i, "")
    .replace(/<\/p>\s*$/i, "")
    .trim();
}

function wrap(html: string | undefined): string {
  if (!html) return "";
  return /<p[ >]/i.test(html) ? html : `<p>${html}</p>`;
}

export function RichInline({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch (Next + Tiptap v3)
    extensions: [
      StarterKit.configure({
        // contract-only: keep document/paragraph/text/bold/link/history; drop the rest.
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        italic: false,
        underline: false,
        link: { openOnClick: false, autolink: false },
      }),
    ],
    content: wrap(value),
    editorProps: {
      attributes: {
        class: "min-h-[2.25rem] px-3 py-2 text-sm outline-none [&_a]:text-foreground [&_a]:underline",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange(stripWrapper(editor.getHTML())),
  });

  if (!editor) {
    return (
      <div className={cn("rounded-md border border-input bg-card", className)}>
        <div className="min-h-[2.25rem] px-3 py-2 text-sm text-muted-foreground">{placeholder}</div>
      </div>
    );
  }

  const isActive = (name: string) => editor.isActive(name);

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className={cn("rounded-md border border-input bg-card focus-within:ring-2 focus-within:ring-ring", className)}>
      <div className="flex items-center gap-1 border-b border-border px-1 py-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
          aria-pressed={isActive("bold")}
          className={cn("rounded p-1 hover:bg-secondary", isActive("bold") && "bg-secondary")}
        >
          <BoldIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={toggleLink}
          aria-label={isActive("link") ? "Remove link" : "Add link"}
          aria-pressed={isActive("link")}
          className={cn("rounded p-1 hover:bg-secondary", isActive("link") && "bg-secondary")}
        >
          {isActive("link") ? <Link2Off className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
