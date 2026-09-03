import type { Metadata } from "next";
import { Bangers, Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Comic-pop type system: Bangers = logo/burst accents, Archivo Black = headings,
// Space Grotesk = body + numbers, Space Mono = raw data / provenance.
const bangers = Bangers({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});
const archivo = Archivo_Black({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});
const grotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});
const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "infojunta — Government data, decoded",
  description:
    "Fresh Indian central-government releases — RBI rates, forex reserves, the Union Budget — translated into clean, readable, transparent data. No login. No paywall.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bangers.variable} ${archivo.variable} ${grotesk.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Analytics />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
