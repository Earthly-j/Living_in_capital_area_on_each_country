import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneShot — Write once. Post everywhere.",
  description:
    "Post your item to 당근, 번개장터, 중고나라 and Craigslist Seoul from one form. AI writes platform-optimized listings, the guided queue walks you through posting in ~2 minutes.",
  keywords: ["OneShot", "중고거래", "당근마켓", "번개장터", "중고나라", "Craigslist", "cross-posting", "multi-platform listing"],
  authors: [{ name: "OneShot" }],
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
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
