import type { ReactNode } from 'react'
import type { MediaRef } from '@/lib/data/media'
import { isDocRef, formatBytes } from '@/src/lib/media/ref'

// Renders a document `MediaRef` (e.g. a certificate PDF) as a labelled download/preview
// link — filename + format + human size — never `next/image` (FR-MEDIA-018, register §B1).
// A null/withdrawn/non-document ref degrades to `fallback` (default: nothing).
//
// NB: the prop is `media`, not `ref` — `ref` is reserved by React.

type MediaDocLinkProps = {
  media?: MediaRef | null
  className?: string
  /** Override the visible label (defaults to the original filename). */
  label?: string
  fallback?: ReactNode
}

export function MediaDocLink({ media, className, label, fallback = null }: MediaDocLinkProps) {
  if (!isDocRef(media)) return <>{fallback}</>

  const name = label ?? media.original_filename ?? 'Document'
  const format = media.format ? media.format.toUpperCase() : null
  const size = formatBytes(media.bytes)
  const meta = [format, size].filter(Boolean).join(' · ')

  return (
    <a href={media.url} className={className} target="_blank" rel="noopener noreferrer" download>
      <span>{name}</span>
      {meta ? <span> ({meta})</span> : null}
    </a>
  )
}
