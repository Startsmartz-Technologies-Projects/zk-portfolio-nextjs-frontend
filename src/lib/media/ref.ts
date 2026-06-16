import type { MediaRef } from '@/lib/data/media'

// Narrowing helpers over the `MediaRef` union that `lib/data` embeds in every public
// response. The union is: image `{ id, url, alt, width, height }`, document
// `{ id, url, format, original_filename, bytes }`, or withdrawn `{ id, withdrawn: true }`
// (a soft-deleted asset — BR-4). Consumers render the right primitive off these guards.

export type ImageRef = Extract<MediaRef, { alt: string | null }>
export type DocRef = Extract<MediaRef, { format: string }>
export type WithdrawnRef = Extract<MediaRef, { withdrawn: true }>

/** A ref whose underlying asset was deleted — render the missing state, never a broken image. */
export function isWithdrawnRef(ref: MediaRef | null | undefined): ref is WithdrawnRef {
  return !!ref && 'withdrawn' in ref
}

/** An image asset (carries dimensions + alt). */
export function isImageRef(ref: MediaRef | null | undefined): ref is ImageRef {
  return !!ref && !('withdrawn' in ref) && !('format' in ref)
}

/** A document asset (carries filename/format/bytes; rendered as a link, not an image). */
export function isDocRef(ref: MediaRef | null | undefined): ref is DocRef {
  return !!ref && !('withdrawn' in ref) && 'format' in ref
}

/** Human-readable file size for document links (e.g. 2.4 MB). */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0 || !Number.isFinite(bytes)) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exp)
  const rounded = exp === 0 ? value : Math.round(value * 10) / 10
  return `${rounded} ${units[exp]}`
}
