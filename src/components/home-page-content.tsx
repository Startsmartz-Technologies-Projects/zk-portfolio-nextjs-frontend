"use client";

import { Hero, Expertise, Stats } from "./sections1";
import { About, Projects, Services, Network, Certifications } from "./sections2";
import { TrustedBy, Testimonials, Insights, News, CTABanner } from "./sections3";

export function HomePageContent() {
  return (
    <>
      <Hero variant="skyline" />
      <Expertise />
      <Stats />
      <About />
      <Projects />
      <Services />
      {/* <Network /> */}
      <TrustedBy />
      <Certifications />
      <Testimonials />
      {/* <Insights /> */}
      {/* <News /> */}
      <CTABanner />
    </>
  );
}