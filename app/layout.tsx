import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionRoot } from "@/components/providers/motion-root";
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
  title: "Patrick MacLyman — notebook",
  description:
    "Personal knowledge-graph site spike: git-backed collections, agent MCP, and motion lab.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
