import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Compass, History, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "TouchLess AI — AI That Wants You to Stop Using It",
  description:
    "An open-source, open-weight AI outdoor mission generator that encourages you to leave your screen and reconnect with the real world.",
  keywords: [
    "touch grass",
    "screen free",
    "outdoor missions",
    "nature",
    "open weight ai",
    "google gemma",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2D6A4F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
        {/* Minimal Navigation Bar */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-[#0d1410]/75 border-b border-black/5 dark:border-white/5 transition-colors">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group font-semibold text-emerald-800 dark:text-emerald-400 hover:opacity-90 transition-opacity"
            >
              <span className="text-xl">🌿</span>
              <span className="tracking-tight text-base sm:text-lg">TouchLess AI</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 ml-1">
                Gemma 3
              </span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/mission/setup"
                className="text-xs sm:text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>New Mission</span>
              </Link>
              <Link
                href="/history"
                className="text-xs sm:text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-200/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 transition-colors"
                title="Mission History"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 flex flex-col">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="w-full border-t border-black/5 dark:border-white/5 py-4 text-center text-xs text-muted-foreground">
          <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Hacktoberfest 2026 — <span className="text-emerald-700 dark:text-emerald-400 font-medium">Touch Grass Challenge</span>
            </p>
            <p className="italic">
              &ldquo;The better it works, the sooner you put your phone away.&rdquo;
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
