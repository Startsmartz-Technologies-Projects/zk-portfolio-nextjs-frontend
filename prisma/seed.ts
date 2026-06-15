import { PrismaClient } from '@prisma/client'
import { seedAuth } from './seed/auth.seed'
import { seedMedia } from './seed/media.seed'
import { seedSite } from './seed/site.seed'

const db = new PrismaClient()

async function main() {
  await seedAuth(db)
  await seedMedia(db)
  await seedSite(db)
  // Subsequent module be-1 tasks register their seeders here (seo, …).
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
