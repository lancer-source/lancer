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
  title: "Lancer — Your Skills, Your Income",
  description:
    "Connect directly with homeowners who need your expertise. Set your own rates. Work your own schedule. No middleman taking your earnings. Join the Lancer waitlist today.",
  keywords: [
    "home services",
    "skilled workers",
    "freelance",
    "handyman",
    "marketplace",
    "no middleman",
  ],
  openGraph: {
    title: "Lancer — Your Skills, Your Income",
    description:
      "Connect directly with homeowners. Set your own rates. Work on your schedule. No middleman.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
