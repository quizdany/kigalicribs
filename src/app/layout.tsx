import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TuraNeza | Homes for Rent in Kigali",
    template: "%s | TuraNeza",
  },
  description: "Find verified apartments, houses, studios and rooms in Kigali, directly from property owners.",
  applicationName: "TuraNeza",
  keywords: ["Kigali rentals", "Rwanda property", "apartments in Kigali", "houses for rent"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
