import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // The site uses a hand-rolled `.container` (max-width: 1320px; margin: 0 auto) in
  // styles.css. Tailwind's own `container` core plugin emits a competing `.container`
  // whose responsive max-width rules live inside @media queries — and those override the
  // plain custom rule on wide viewports, while Tailwind's container has no centering
  // margin. The result is full-width, left-aligned content. Disable the core plugin so the
  // custom `.container` owns the class.
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      colors: {
        brandLime: "var(--lime)",
        brandGold: "var(--gold)",
        brandBlack: "var(--black)",
      },
    },
  },
  plugins: [],
};

export default config;
