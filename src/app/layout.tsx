import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
        className={`${outfit.variable} antialiased`}
        style={{ background: "#090C14", fontFamily: "'Outfit', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
