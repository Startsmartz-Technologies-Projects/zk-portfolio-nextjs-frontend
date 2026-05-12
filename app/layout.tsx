import type { Metadata } from "next";
import "./globals.css";
import "../src/styles/styles.css";
import "../src/styles/legacy_pages.css";

export const metadata: Metadata = {
  title: "Zakir Enterprise",
  description: "Construction and infrastructure portfolio in Next.js",
  icons: {
    icon: "https://res.cloudinary.com/dk4csiouq/image/upload/v1777180913/Heading_24_t5zzbn.png",
    shortcut: "https://res.cloudinary.com/dk4csiouq/image/upload/v1777180913/Heading_24_t5zzbn.png",
    apple: "https://res.cloudinary.com/dk4csiouq/image/upload/v1777180913/Heading_24_t5zzbn.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
