import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MotionConfig } from "framer-motion";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Display serif — used only for big editorial headlines, to create typographic
// contrast against the Outfit UI/body font. Loaded but never set as the body
// default; applied inline via var(--font-display).
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "BlueBay Auto Care — Mobile Detailing SF",
  description:
    "Professional mobile auto detailing in San Francisco. We come to you with eco-friendly products and premium tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${playfair.variable} antialiased`}
        style={{ background: "#090C14", fontFamily: "'Outfit', sans-serif" }}
      >
        {/* reducedMotion="user" makes all framer-motion animations app-wide
            respect the user's OS/browser reduce-motion setting automatically. */}
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
        </MotionConfig>
      </body>
    </html>
  );
}
