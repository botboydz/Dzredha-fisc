import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DZ-Fisc — Conformité Fiscale & Sociale Automatisée",
  description:
    "Automatisez vos déclarations fiscales (TAP, IBS, IRG, TVA) et sociales (CNAS, CASNOS) en Algérie. Calculs, formulaires et alertes — tout en un.",
  keywords: [
    "DZ-Fisc",
    "fiscalité Algérie",
    "TAP",
    "IBS",
    "IRG",
    "TVA",
    "CNAS",
    "CASNOS",
    "déclaration fiscale",
    "conformité",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f0fdf4] text-foreground`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
