import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter_Tight, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-numeric",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Casino Ledger",
    template: "%s · Casino Ledger",
  },
  description: "カジノ収支を上品に記録する、大人のためのプレイヤー帳簿。",
  applicationName: "Casino Ledger",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Casino Ledger",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#08120e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${playfair.variable} ${interTight.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
