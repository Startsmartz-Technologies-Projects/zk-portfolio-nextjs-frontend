// Pure platform→icon-key mapping for the footer socials. Kept free of any server imports
// so the client Footer can import it without pulling lib/data (Prisma) into the browser
// bundle. The Social component supports fb/ig/li/yt.
export function socialIconKey(platform: string): string {
  const p = platform.toLowerCase()
  if (p.includes('face')) return 'fb'
  if (p.includes('insta')) return 'ig'
  if (p.includes('linked')) return 'li'
  if (p.includes('you')) return 'yt'
  return p
}
