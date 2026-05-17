import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReguMate — AI Regulatory Compliance Agent",
  description:
    "Continuous AI-powered compliance monitoring that maps your infrastructure to SOC 2, GDPR, HIPAA, and ISO 27001 — and finds the gaps before auditors do.",
  keywords: [
    "ReguMate",
    "compliance",
    "SOC 2",
    "GDPR",
    "HIPAA",
    "ISO 27001",
    "AI compliance",
    "audit automation",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
