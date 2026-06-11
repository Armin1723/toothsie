import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import InstallPWA from "@/components/InstallPWA";
import PiyuuuEasterEgg from "@/components/PiyuuuEasterEgg";
import ShakeEasterEgg from "@/components/ShakeEasterEgg";
import SplashScreen from "@/components/SplashScreen";
import UpdateBanner from "@/components/UpdateBanner";
import ThemePicker from "@/components/ThemePicker";
import { ThemeProvider } from "@/lib/ThemeContext";
import { SettingsProvider } from "@/lib/SettingsContext";

export const metadata: Metadata = {
  metadataBase: new URL('https://tooth-vault.vercel.app'),
  title: "Piyuuu's Tooth Vault 🦷",
  description: "Your smart dental study companion — flashcards, case studies, and a chat buddy for BDS students!",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-512.svg",
  },
  openGraph: {
    title: "Piyuuu's Tooth Vault 🦷",
    description: "Your smart dental study companion — flashcards, case studies, and a chat buddy for BDS students!",
    type: "website",
    siteName: "Tooth Vault",
    images: [{ url: "/icons/icon-512.svg", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piyuuu's Tooth Vault 🦷",
    description: "Your smart dental study companion — flashcards, case studies, and a chat buddy for BDS students!",
    images: ["/icons/icon-512.svg"],
  },
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
    <html lang="en" className="theme-piyuu">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-512.svg" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen pb-20">
        <ThemeProvider>
          <SettingsProvider>
            <div className="max-w-lg mx-auto relative min-h-screen">
              {children}
              <Navigation />
              <InstallPWA />
              <SplashScreen />
              <PiyuuuEasterEgg />
              <ShakeEasterEgg />
              <UpdateBanner />
              <ThemePicker />
            </div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
