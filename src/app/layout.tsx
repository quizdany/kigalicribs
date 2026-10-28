import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "TuraKGL | Homes for rent in Kigali",
    template: "%s | TuraKGL",
  },
  description: "Find verified apartments, houses, studios and rooms in Kigali, directly from property owners.",
  applicationName: "TuraKGL",
  icons: { icon: "/images/turakgl-home-finder.svg?v=2" },
  keywords: ["Kigali rentals", "Rwanda property", "apartments in Kigali", "houses for rent"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kigalicribs.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "TuraKGL",
    title: "TuraKGL | Homes for rent in Kigali",
    description: "Find apartments, houses, studios and rooms in Kigali, directly from property owners.",
    images: [{ url: "/images/kigali-hd.jpg", alt: "Kigali hills at dusk" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">Skip to content</a>
        <SiteHeader />
        <div id="main-content" className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
