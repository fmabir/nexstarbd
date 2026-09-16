import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";
import "./globals.css";

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
  themeColor: "#d3fbe4", // matches the navbar so mobile browser chrome blends in
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
    <html lang={locale}>
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
