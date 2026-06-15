import { PrismaClient } from '@prisma/client'
import { seedAuth } from './seed/auth.seed'

const db = new PrismaClient()

async function main() {
  await seedAuth(db)
  // Subsequent module be-1 tasks register their seeders here (media, site, seo, …).
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
