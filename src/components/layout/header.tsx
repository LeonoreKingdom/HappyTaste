import Link from "next/link";
import { Home, Utensils, Tag } from "lucide-react";

import { AccountSessionControl } from "@/components/layout/account-session-control";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-orange-100 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="HappyTaste — beranda"
          className="flex shrink-0 items-center gap-2 font-bold text-xl text-orange-600"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">HappyTaste</span>
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-6">
          <nav
            aria-label="Navigasi utama"
            className="flex items-center gap-1 text-sm font-medium text-gray-700 sm:gap-6"
          >
            <Link
              href="/"
              aria-label="Beranda"
              title="Beranda"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 transition-colors hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <Home aria-hidden="true" className="h-4 w-4 sm:hidden" />
              <span className="sr-only sm:not-sr-only">Beranda</span>
            </Link>
            <Link
              href="/menu"
              aria-label="Menu"
              title="Menu"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 transition-colors hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <Utensils aria-hidden="true" className="h-4 w-4 sm:hidden" />
              <span className="sr-only sm:not-sr-only">Menu</span>
            </Link>
            <Link
              href="/promo"
              aria-label="Promo"
              title="Promo"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 transition-colors hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <Tag aria-hidden="true" className="h-4 w-4 sm:hidden" />
              <span className="sr-only sm:not-sr-only">Promo</span>
            </Link>
          </nav>
          <AccountSessionControl />
        </div>
      </div>
    </header>
  );
}
