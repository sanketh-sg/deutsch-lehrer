import type { Metadata } from "next";
import Link from "next/link";
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
      <body className="flex min-h-full flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <nav className="border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex max-w-6xl gap-5 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold">
              Deutsch Lehrer
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              Practice
            </Link>
            <Link href="/verbs" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              Verbs
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
