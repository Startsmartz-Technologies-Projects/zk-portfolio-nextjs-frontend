// Cloudinary delivery-URL rewriting for the `next/image` custom loader (FR-MEDIA-013).
//
// `lib/data` hands us full Cloudinary delivery URLs (the MediaAsset `url`). Rather than
// rebuild them from a cloud name, we inject a responsive transformation segment
// (`f_auto,q_auto,w_<width>`) immediately after `/upload/` so `next/image` emits
// width-appropriate, auto-format/quality variants. Non-Cloudinary URLs (residual
// Unsplash/S3 assets, local `/public` files) pass through untouched — re-homing them is
// a content/ops task, out of scope here (brief: web-fe-image-pipeline).

const CLOUDINARY_HOST = 'res.cloudinary.com'

/** True for a Cloudinary delivery URL we can transform (has the `/upload/` delivery segment). */
export function isCloudinaryUrl(src: string): boolean {
  return src.includes(`${CLOUDINARY_HOST}/`) && src.includes('/upload/')
}

export interface LoaderParams {
  src: string
  width: number
  quality?: number
}

/**
 * Build the delivery URL `next/image` requests for a given width. For Cloudinary URLs we
 * inject `f_auto,q_auto,w_<width>` (and `q_<quality>` when an explicit quality is asked)
 * as the first transformation component after `/upload/`; chained existing transforms are
 * left in place (later components are applied after ours, which is harmless). Everything
 * else is returned verbatim so a global loader never breaks non-Cloudinary images.
 */
export function buildCloudinaryUrl({ src, width, quality }: LoaderParams): string {
  if (!isCloudinaryUrl(src)) return src

  const transforms = [`f_auto`, quality ? `q_${quality}` : `q_auto`, `w_${width}`].join(',')
  // Insert our segment right after the first `/upload/`; keep the rest (version + public id,
  // and any pre-existing transforms) exactly as delivered.
  return src.replace('/upload/', `/upload/${transforms}/`)
}
