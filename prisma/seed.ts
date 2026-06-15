import { PrismaClient } from '@prisma/client'
import { seedAuth } from './seed/auth.seed'
import { seedMedia } from './seed/media.seed'
import { seedSite } from './seed/site.seed'
import { seedSeo } from './seed/seo.seed'
import { seedProjects } from './seed/projects.seed'

const db = new PrismaClient()

async function main() {
  await seedAuth(db)
  await seedMedia(db)
  await seedSite(db)
  await seedSeo(db)
  await seedProjects(db)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
