import Image from 'next/image'
import type { ReactNode } from 'react'
import type { MediaRef } from '@/lib/data/media'
import { isImageRef } from '@/src/lib/media/ref'

// Shared wrapper that renders an image `MediaRef` through `next/image` + the Cloudinary
// loader (FR-MEDIA-018). Wave-B/C module briefs swap their `<img>`/CSS backgrounds for
// this so transformation, alt, and the withdrawn-asset state are handled uniformly.
// Alt always comes from the ref — never an empty string when the ref carries alt text
// (FR-MEDIA-010). A null/withdrawn/non-image ref degrades to `fallback` (default: nothing),
// so a deleted asset never renders a broken image (register Media cross-module note).
//
// NB: the prop is `media`, not `ref` — `ref` is reserved by React and would be intercepted.

type MediaImageProps = {
  media?: MediaRef | null
  /** Background/hero mode — fills a positioned parent instead of intrinsic dimensions. */
  fill?: boolean
  sizes?: string
  className?: string
  priority?: boolean
  /** Override the ref's intrinsic dimensions (intrinsic mode only). */
  width?: number
  height?: number
  /** Rendered when the ref is missing/withdrawn/not an image. */
  fallback?: ReactNode
}

export function MediaImage({ media, fill, sizes, className, priority, width, height, fallback = null }: MediaImageProps) {
  if (!isImageRef(media)) return <>{fallback}</>

  // Alt gate: use the ref's alt verbatim; only an asset with no alt text renders as
  // decorative (empty). We never overwrite a present alt with "".
  const alt = media.alt ?? ''

  if (fill) {
    return <Image src={media.url} alt={alt} fill sizes={sizes} className={className} priority={priority} />
  }

  const w = width ?? media.width ?? undefined
  const h = height ?? media.height ?? undefined
  // Without intrinsic dimensions next/image cannot size an intrinsic image — fall back to
  // fill so a dimensionless ref never crashes the render (caller positions the parent).
  if (w == null || h == null) {
    return <Image src={media.url} alt={alt} fill sizes={sizes} className={className} priority={priority} />
  }

  return <Image src={media.url} alt={alt} width={w} height={h} sizes={sizes} className={className} priority={priority} />
}
