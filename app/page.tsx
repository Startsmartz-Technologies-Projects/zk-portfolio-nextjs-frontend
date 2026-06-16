import { HomePageContent } from "@/src/components/home-page-content";
import { getFeaturedProjects } from "@/lib/data/projects";
import { getHomeSeals } from "@/lib/data/certifications";
import { REVALIDATE } from "@/src/lib/site/taxonomy";
import type { HomeFeaturedProject, HomeSeal } from "@/src/components/sections2";

// Home route is a server component so the "Featured Projects" strip and the certification "seals"
// strip are server-rendered from getFeaturedProjects (projects-fe-public §F) + getHomeSeals
// (certifications-fe-public §E); the data threads down into the client home shell.
export const revalidate = REVALIDATE;

export default async function Page() {
  const [featured, seals] = await Promise.all([getFeaturedProjects(), getHomeSeals()]);
  const featuredProjects = featured.data as HomeFeaturedProject[];
  const homeSeals = seals.data as HomeSeal[];
  return (
    <>
      <HomePageContent featuredProjects={featuredProjects} homeSeals={homeSeals} />
    </>
  );
}
