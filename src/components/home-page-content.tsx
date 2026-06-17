"use client";

import { Hero, Expertise, Stats } from "./sections1";
import { About, Projects, Services, Network, Certifications, type HomeFeaturedProject, type HomeSeal } from "./sections2";
import { TrustedBy, Testimonials, Insights, News, CTABanner } from "./sections3";

export function HomePageContent({ featuredProjects = [], homeSeals = [] }: { featuredProjects?: HomeFeaturedProject[]; homeSeals?: HomeSeal[] }) {
  return (
    <>
      <Hero variant="skyline" />
      <Expertise />
      <Stats />
      <About />
      <Projects featuredProjects={featuredProjects} />
      <Services />
      {/* <Network /> */}
      <TrustedBy />
      <Certifications homeSeals={homeSeals} />
      <Testimonials />
      {/* <Insights /> */}
      {/* <News /> */}
      <CTABanner />
    </>
  );
}