import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Brian Hoogerwerf",
  description: "Salesforce consultant, leader, and technologist. Explore my projects, experience, and interests.",
  openGraph: {
    title: "Brian Hoogerwerf",
    description: "Salesforce consultant, leader, and technologist.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
      <GoogleAnalytics gaId="G-KNPW3M23KP" />
    </html>
  );
}
