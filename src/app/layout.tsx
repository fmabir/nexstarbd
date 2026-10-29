import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Barlow_Semi_Condensed, Fraunces, Inter, Kaushan_Script } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";
import "./globals.css";

// Inter — body text, buttons, navigation and most of the interface (font-sans)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fraunces — decorative headings, board titles and big score numbers
// (font-display on desktop, font-m-display on phones). Variable, with
// optical sizing so large titles get the display cut automatically.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Only for the "BD" in the phone wordmark, which keeps its original letters
const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-barlow",
  display: "swap",
});

// Brush handwriting for "NexStar" in the phone wordmark (font-m-hand)
const kaushan = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexStarBD — Bangladesh Free Fire Community Tournaments",
  description:
    "Weekly Free Fire squad tournaments in Bangladesh. Free registration, prize pools, and a growing esports community.",
  keywords: ["Free Fire", "Bangladesh", "tournament", "esports", "gaming"],
  icons: {
    icon: "/banners/lnsbd.png",
    shortcut: "/banners/lnsbd.png",
    apple: "/banners/lnsbd.png",
  },
  openGraph: {
    title: "NexStarBD — Bangladesh Free Fire Tournaments",
    description: "Join weekly Free Fire squad battles. Free registration!",
    type: "website",
  },
};

// The viewport meta tag is emitted by default; this adds the mobile browser
// chrome colour and keeps pinch-zoom enabled (no maximumScale/userScalable).
export const viewport: Viewport = {
  // Browser chrome matches the bar under it: the white phone shell below md,
  // the light-green navbar above it
  themeColor: [
    { media: "(max-width: 767px)", color: "#ffffff" },
    { color: "#d3fbe4" },
  ],
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable} ${barlow.variable} ${kaushan.variable}`}>
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-053SQ6TH20"
        />
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-053SQ6TH20');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <TransitionOverlay />
<ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
