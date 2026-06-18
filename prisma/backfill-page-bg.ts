/**
 * One-off backfill: link section background images that the original Pages seed dropped
 * because their source URLs were non-Cloudinary (Unsplash / S3) placeholders.
 *
 * The seeder now imports allowlisted non-Cloudinary hosts (pages.seed.ts `ensureMedia`),
 * but the `home` / `about` / `lets_collaborate` pages were already seeded with
 * `backgroundImageId = null`. This walks the seed definitions, and for every section that
 * (a) currently has no background image and (b) has a resolvable seed URL, creates/links
 * the MediaAsset. Idempotent: re-running links nothing new. Existing (non-null) background
 * images and all admin edits are left untouched.
 *
 *   npx tsx prisma/backfill-page-bg.ts
 */
import { PrismaClient } from '@prisma/client'
import { PAGES_SEED, INDEX_PAGES, ensureMedia } from './seed/pages.seed'

const db = new PrismaClient()

async function main() {
  const admin = await db.user.findFirst({ where: { role: 'admin', deletedAt: null }, select: { id: true } })
  const actorId = admin?.id ?? null

  let linked = 0
  let alreadySet = 0
  let noUrl = 0
  let unresolvable = 0

  for (const seedPage of [...PAGES_SEED, ...INDEX_PAGES]) {
    const page = await db.page.findUnique({ where: { key: seedPage.key }, select: { id: true } })
    if (!page) continue

    const sections = await db.pageSection.findMany({
      where: { pageId: page.id },
      orderBy: { position: 'asc' },
      select: { id: true, position: true, backgroundImageId: true },
    })

    for (const seedSection of seedPage.sections) {
      const url = seedSection.backgroundImage
      if (!url) {
        noUrl++
        continue
      }
      // Match by position — the seeder writes sections in array order.
      const idx = seedPage.sections.indexOf(seedSection)
      const row = sections.find((s) => s.position === idx)
      if (!row) continue
      if (row.backgroundImageId) {
        alreadySet++
        continue
      }
      const mediaId = await ensureMedia(db, url, actorId)
      if (!mediaId) {
        unresolvable++
        console.warn(`  unresolvable URL on ${seedPage.key}#${idx}: ${url}`)
        continue
      }
      await db.pageSection.update({ where: { id: row.id }, data: { backgroundImageId: mediaId } })
      linked++
      console.log(`  linked ${seedPage.key}#${idx} -> ${url.slice(0, 70)}`)
    }
  }

  console.log(`\nBackfill done: ${linked} linked, ${alreadySet} already set, ${noUrl} sections without a bg URL, ${unresolvable} unresolvable.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
