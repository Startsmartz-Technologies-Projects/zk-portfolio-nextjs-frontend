import { buildCloudinaryUrl } from '@/src/lib/media/cloudinary-url'

// `next/image` custom loader (wired in next.config.js via images.loaderFile). Kept as a
// thin default-export wrapper so the URL logic stays unit-testable in cloudinary-url.ts.
export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  return buildCloudinaryUrl({ src, width, quality })
}
