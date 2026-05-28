// new release garudashield source
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "GarudaShield AI",
  description: "Asisten Keamanan Siber Nasional Indonesia",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden max-w-[100vw]`}
    >
      <body className="min-h-full flex flex-col bg-black overflow-x-hidden w-full max-w-[100vw]">
        <Navbar />
        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden flex flex-col relative">
          {children}
        </main>
      </body>
    </html>
  );
}
