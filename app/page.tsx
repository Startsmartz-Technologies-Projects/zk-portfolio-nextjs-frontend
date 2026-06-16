import { HomePageContent } from "@/src/components/home-page-content";
import { getFeaturedProjects } from "@/lib/data/projects";
import { REVALIDATE } from "@/src/lib/site/taxonomy";
import type { HomeFeaturedProject } from "@/src/components/sections2";

// Home route is a server component so the "Featured Projects" strip is server-rendered from
// getFeaturedProjects (projects-fe-public §F); the data threads down into the client home shell.
export const revalidate = REVALIDATE;

export default async function Page() {
  const featured = await getFeaturedProjects();
  const featuredProjects = featured.data as HomeFeaturedProject[];
  return (
    <>
      <HomePageContent featuredProjects={featuredProjects} />
    </>
  );
}
