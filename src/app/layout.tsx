import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Ticker } from "@/components/ticker";

// Clean-pop type system: Archivo Black = display + headings (heavy, tight),
// Space Grotesk = body + numbers, Space Mono = labels / tickers / provenance.
// (--font-display maps to --font-heading in globals.css.)
const archivo = Archivo_Black({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});
const grotesk = Space_Grotesk({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const mono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kya haal junta? — Government data, decoded",
  description:
    "Fresh Indian central-government releases — RBI rates, forex reserves, the Union Budget — translated into clean, readable, transparent data. No login. No paywall.",
};

// Set the theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${grotesk.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Analytics />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Ticker />
        <SiteFooter />
      </body>
    </html>
  );
}
