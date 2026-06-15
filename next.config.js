/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set turbopack.root to the project directory so chunk names are relative
  // to this folder (not the deeply-nested OneDrive path), avoiding Windows MAX_PATH.
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/Zakir%20Enterprise.html", destination: "/", permanent: false },
      { source: "/Projects.html", destination: "/projects", permanent: false },
      { source: "/News%20Corner.html", destination: "/news", permanent: false },
      { source: "/Blogs.html", destination: "/blogs", permanent: false },
      { source: "/Let%27s%20Collaborate.html", destination: "/lets-collaborate", permanent: false },
      { source: "/Service%20Details.html", destination: "/service-details/heavy-civil-infrastructure-development", permanent: false },
      { source: "/Concern%20Detail.html", destination: "/concern-detail", permanent: false },
      { source: "/Certifications.html", destination: "/certifications", permanent: false },
    ];
  },
};

module.exports = nextConfig;
