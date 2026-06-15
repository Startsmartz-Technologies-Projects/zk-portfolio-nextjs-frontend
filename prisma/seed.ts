import { PrismaClient } from '@prisma/client'
import { seedAuth } from './seed/auth.seed'
import { seedMedia } from './seed/media.seed'
import { seedSite } from './seed/site.seed'
import { seedSeo } from './seed/seo.seed'
import { seedProjects } from './seed/projects.seed'
import { seedServices } from './seed/services.seed'
import { seedBlog } from './seed/blog.seed'
import { seedNews } from './seed/news.seed'
import { seedCertifications } from './seed/certifications.seed'
import { seedConcerns } from './seed/concerns.seed'
import { seedPages } from './seed/pages.seed'

const db = new PrismaClient()

async function main() {
  await seedAuth(db)
  await seedMedia(db)
  await seedSite(db)
  await seedSeo(db)
  await seedProjects(db)
  await seedServices(db)
  await seedBlog(db)
  await seedNews(db)
  await seedCertifications(db)
  await seedConcerns(db)
  await seedPages(db)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
