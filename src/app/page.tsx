import Link from "next/link";
import { mockBanners, mockPromos } from "@/data/mock-promos";
import { PromoCarousel } from "@/components/promo/promo-carousel";
import { PromoPopupDialog } from "@/components/promo/promo-popup-dialog";
import { Utensils, Calendar, MapPin, Sparkles, Tag, Gift, Award } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Pop Up Promo Modal - Once Per Session */}
      <PromoPopupDialog promo={mockPromos[0]} />

      {/* Hero Promo Banner Carousel Section */}
      <section aria-label="Banner Promo Bergilir">
        <PromoCarousel banners={mockBanners} promos={mockPromos} />
      </section>

      {/* Quick Access Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/menu"
          className="flex items-center gap-4 p-5 rounded-xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              Jelajah Menu
            </h2>
            <p className="text-xs text-gray-500">Pilihan hidangan lezat resto</p>
          </div>
        </Link>

        <Link
          href="/reservasi"
          className="flex items-center gap-4 p-5 rounded-xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
              Reservasi Meja
            </h2>
            <p className="text-xs text-gray-500">Pesan tempat tanpa antre</p>
          </div>
        </Link>

        <Link
          href="/lokasi"
          className="flex items-center gap-4 p-5 rounded-xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
              Lokasi Outlet
            </h2>
            <p className="text-xs text-gray-500">Temukan resto terdekat</p>
          </div>
        </Link>
      </section>

      {/* Promo List Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Penawaran Terbatas</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Promo Menarik Minggu Ini</h2>
          </div>
          <Link
            href="/promo"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
          >
            Lihat Semua Promo &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPromos.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div className="h-44 relative overflow-hidden bg-orange-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={promo.bannerUrl}
                  alt={promo.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-semibold flex items-center gap-1 shadow">
                  <Tag className="w-3 h-3" />
                  <span>Promo</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {promo.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Berlaku s.d {new Date(promo.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <Link
                    href={`/promo/${promo.id}`}
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    Syarat & Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Member Benefit Callout */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>HappyTaste Loyalty Club</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Gabung Member & Dapatkan Poin Setiap Transaksi</h2>
          <p className="text-sm text-amber-100 max-w-lg">
            Nikmati kemudahan reservasi prioritas, pesan menu lebih awal, dan kumpulkan poin loyalitas yang dapat ditukar dengan sajian gratis.
          </p>
        </div>
        <Link
          href="/login"
          className="whitespace-nowrap px-6 py-3 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          <span>Daftar Sekarang</span>
        </Link>
      </section>
    </div>
  );
}
