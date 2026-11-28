import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "A3 Coach",
  description: "Turn a problem described in plain language into a problem-solving A3.",
  // A private, invite-only proof of concept: keep every page out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-blue-800 focus:outline-2 focus:outline-blue-700"
        >
          Skip to main content
        </a>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
            <Link href="/a3" className="text-base font-semibold tracking-tight">
              A3 Coach
            </Link>
            <span className="text-xs text-slate-500">Proof of concept · test data only</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-1 px-6 py-3 text-xs text-slate-600">
            <Link href="/privacy" className="underline underline-offset-2 hover:text-slate-900">
              Privacy notice
            </Link>
            <span>Proof of concept for invited testers. Use synthetic test data only.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
