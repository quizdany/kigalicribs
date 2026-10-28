import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "TuraKGL | Homes for Rent in Kigali",
    template: "%s | TuraKGL",
  },
  description: "Find verified apartments, houses, studios and rooms in Kigali, directly from property owners.",
  applicationName: "TuraKGL",
  icons: { icon: "/images/turakgl-home-finder.svg?v=2" },
  keywords: ["Kigali rentals", "Rwanda property", "apartments in Kigali", "houses for rent"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
        <SiteHeader />
        <div id="main-content" className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
