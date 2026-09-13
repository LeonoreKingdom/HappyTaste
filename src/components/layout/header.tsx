import Link from "next/link";
import { Utensils, Tag } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-orange-100 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
            <Utensils className="w-5 h-5" />
          </div>
          <span>HappyTaste</span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="flex items-center gap-3 text-sm font-medium text-gray-700 sm:gap-6"
        >
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Beranda
          </Link>
          <Link
            href="/menu"
            className="flex items-center gap-1.5 transition-colors hover:text-orange-600"
          >
            <Utensils className="w-4 h-4" />
            Menu
          </Link>
          <Link
            href="/promo"
            className="flex items-center gap-1.5 transition-colors hover:text-orange-600"
          >
            <Tag className="w-4 h-4" />
            Promo
          </Link>
        </nav>
      </div>
    </header>
  );
}
