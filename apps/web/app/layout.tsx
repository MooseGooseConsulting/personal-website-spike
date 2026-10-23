import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Fraunces,
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Syne,
} from "next/font/google";
import { MotionRoot } from "@/components/providers/motion-root";
import { SKIN_STORAGE_KEY } from "@/lib/skins";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const skinBootstrap = `(function(){try{var s=localStorage.getItem(${JSON.stringify(SKIN_STORAGE_KEY)});if(s)document.documentElement.setAttribute("data-skin",s);}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Patrick MacLyman — notebook",
  description:
    "Personal knowledge-graph site spike: git-backed collections, four live skins, agent MCP later.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-skin="ink-voltage"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${spaceGrotesk.variable} ${cormorant.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: skinBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
