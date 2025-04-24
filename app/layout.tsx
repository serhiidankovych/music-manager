import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";

const iBMPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Music Manager",
  description: "Music Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${iBMPlexSans.variable}  antialiased dark`}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
