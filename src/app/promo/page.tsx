import Image from "next/image";
import Link from "next/link";
import { activePromos, getPromoBadgeLabel } from "@/data/mock-promos";
import { Tag, Calendar, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Daftar Promo & Penawaran Spesial - HappyTaste Resto",
  description: "Daftar lengkap promo diskon, menu gratis, dan cashback poin di HappyTaste Resto.",
};

export default function PromoListPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Promo & Penawaran</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Penawaran Spesial HappyTaste
        </h1>
        <p className="text-orange-100 max-w-2xl text-sm sm:text-base">
          Nikmati santap lezat lebih hemat dengan berbagai promo menarik kami.
          Klik salah satu promo di bawah untuk melihat syarat dan ketentuan lengkapnya.
        </p>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePromos.map((promo) => {
          const endDateFormatted = new Date(promo.endDate).toLocaleDateString(
            "id-ID",
            { day: "numeric", month: "short", year: "numeric" }
          );

          return (
            <div
              key={promo.id}
              className="group bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col overflow-hidden"
            >
              {/* Promo Image */}
              <div className="relative h-48 w-full overflow-hidden bg-orange-100">
                <Image
                  src={promo.bannerUrl}
                  alt={promo.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold shadow flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    {getPromoBadgeLabel(promo)}
                  </span>
                </div>
              </div>

              {/* Promo Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors line-clamp-2">
                    {promo.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {promo.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Berlaku hingga: {endDateFormatted}</span>
                  </div>

                  <Link
                    href={`/promo/${promo.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-50 group-hover:bg-orange-600 text-orange-700 group-hover:text-white font-semibold transition-all shadow-sm active:scale-95"
                  >
                    <span>Lihat Detail & Syarat</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Callout */}
      <div className="p-6 rounded-2xl bg-white border border-orange-100 flex items-center gap-4 text-sm text-gray-600 shadow-sm">
        <ShieldCheck className="w-8 h-8 text-orange-600 flex-shrink-0" />
        <p>
          Semua promo di atas resmi dikeluarkan oleh HappyTaste Resto. Pastikan Anda telah menjadi member untuk menikmati promo eksklusif dan mengumpulkan poin loyalitas setiap kali bertransaksi.
        </p>
      </div>
    </main>
  );
}
