import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { createUiText } from "@/components/i18n/ui-text";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
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

const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const ui = createUiText(locale);
  return {
  title: locale === "bn" ? "NexStarBD — বাংলাদেশের ফ্রি ফায়ার Tournaments" : "NexStarBD — Bangladesh Free Fire Community Tournaments",
  description:
    ui("Weekly Free Fire squad tournaments in Bangladesh. Free and paid entry, prize pools, and a growing esports community."),
  keywords: ["Free Fire", "Bangladesh", "tournament", "esports", "gaming"],
  icons: {
    icon: "/banners/lnsbd.png",
    shortcut: "/banners/lnsbd.png",
    apple: "/banners/lnsbd.png",
  },
  openGraph: {
    title: "NexStarBD — Bangladesh Free Fire Tournaments",
    description: ui("Discover weekly Free Fire squad battles, results, and top players."),
    type: "website",
  },
};
}

// The viewport meta tag is emitted by default; this adds the mobile browser
// chrome colour and keeps pinch-zoom enabled (no maximumScale/userScalable).
export const viewport: Viewport = {
  themeColor: "#f5f8fc",
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
    <html lang={locale} className={`${inter.variable} ${bengali.variable}`}>
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-053SQ6TH20"
        />
        <Script
          id="google-analytics-init"
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
