import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "nextstarBD — Bangladesh Free Fire Community Tournaments",
  description:
    "Weekly Free Fire squad tournaments in Bangladesh. Free registration, prize pools, and a growing esports community.",
  keywords: ["Free Fire", "Bangladesh", "tournament", "esports", "gaming"],
  openGraph: {
    title: "nextstarBD — Bangladesh Free Fire Tournaments",
    description: "Join weekly Free Fire squad battles. Free registration!",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${bebasNeue.variable} ${barlow.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
