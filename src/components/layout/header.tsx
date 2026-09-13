import Link from "next/link";
import { Utensils, Tag, Calendar, MapPin, Phone, User } from "lucide-react";

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

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Beranda
          </Link>
          <Link href="/menu" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
            <Utensils className="w-4 h-4" />
            Menu
          </Link>
          <Link href="/promo" className="hover:text-orange-600 transition-colors flex items-center gap-1.5 text-orange-600 font-semibold">
            <Tag className="w-4 h-4" />
            Promo
          </Link>
          <Link href="/reservasi" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Reservasi
          </Link>
          <Link href="/lokasi" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Outlet
          </Link>
          <Link href="/kontak" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            Kontak
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 text-sm font-medium transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Member</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
