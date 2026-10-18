import type { Metadata } from "next";
import { NavMenu } from "@/components/NavMenu";
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
  title: {
    default: "Deutsch Lehrer",
    template: "%s · Deutsch Lehrer",
  },
  description: "Build German sentences in past, present and future.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clipbg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <NavMenu />
        {children}
      </body>
    </html>
  );
}
