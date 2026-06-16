import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

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
        // Admin design tokens (ADR 0002 / foundations §2). The CSS variables are defined
        // only under `.admin-scope` (src/styles/admin-theme.css), so these utilities are
        // inert on the public site and resolve to the admin palette inside the admin shell.
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        status: {
          draft: "var(--status-draft)",
          published: "var(--status-published)",
          archived: "var(--status-archived)",
          danger: "var(--status-danger)",
          warning: "var(--status-warning)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
