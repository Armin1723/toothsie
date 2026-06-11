import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import InstallPWA from "@/components/InstallPWA";
import PiyuuuEasterEgg from "@/components/PiyuuuEasterEgg";

export const metadata: Metadata = {
  title: "Piyuuu's Tooth Vault 🦷",
  description: "Your smart dental study companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tooth Vault",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fdf2f8",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-pink-50 min-h-screen pb-20">
        <div className="max-w-lg mx-auto relative min-h-screen">
          {children}
          <Navigation />
          <InstallPWA />
          <PiyuuuEasterEgg />
        </div>
      </body>
    </html>
  );
}
