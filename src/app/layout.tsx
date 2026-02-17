import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Footer } from "@/components/layout/footer";
import { ChatFAB } from "@/components/chat/chat-fab";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tedlyns.pages.dev"
  ),
  title: {
    default: "Tedlyns — Indulge Yourself",
    template: "%s | Tedlyns",
  },
  description:
    "Abuja's premier culinary logistics. Corporate catering, artisan bakes, and curated gifting.",
  keywords: [
    "Tedlyns",
    "Abuja catering",
    "corporate catering",
    "artisan cakes",
    "curated gifts",
    "culinary logistics",
  ],
  authors: [{ name: "Tedlyns Concept" }],
  creator: "Tedlyns Concept",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Tedlyns",
    title: "Tedlyns — Indulge Yourself",
    description:
      "Abuja's premier culinary logistics. Corporate catering, artisan bakes, and curated gifting.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} dark`}
    >
      <body className="bg-obsidian text-ivory font-sans antialiased min-h-screen">
        <AuthProvider>
        {/* Desktop Header — hidden on mobile */}
        <DesktopHeader />

        {/* Main Content — padded for mobile bottom nav */}
        <main className="pb-20 md:pb-0">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Navigation — hidden on desktop */}
        <MobileBottomNav />

        {/* Floating Concierge Chat Button */}
        <ChatFAB />
        </AuthProvider>
      </body>
    </html>
  );
}
