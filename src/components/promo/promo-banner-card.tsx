import Link from "next/link";
import { Banner, Promo } from "@/types/promo";
import { Tag, ArrowRight, Sparkles } from "lucide-react";

interface PromoBannerCardProps {
  banner: Banner;
  promo?: Promo;
}

export function PromoBannerCard({ banner, promo }: PromoBannerCardProps) {
  const detailHref = banner.link || (banner.promoId ? `/promo/${banner.promoId}` : "#");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xl">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative grid md:grid-cols-2 gap-6 p-6 sm:p-8 md:p-10 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider text-orange-50">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Promo Spesial</span>
          </div>

          <Link href={detailHref} className="block group">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight group-hover:text-orange-100 transition-colors">
              {banner.title}
            </h1>
          </Link>

          <p className="text-orange-100 text-sm sm:text-base leading-relaxed line-clamp-3">
            {promo?.description || "Kunjungi HappyTaste dan nikmati beragam penawaran spesial serta kelezatan menu pilihan kami setiap hari."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-semibold text-sm shadow-md transition-all transform active:scale-95"
            >
              <Tag className="w-4 h-4" />
              <span>Lihat Detail Promo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Link
          href={detailHref}
          className="relative aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-orange-700/50 block group cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-white text-xs font-medium">
            HappyTaste Resto
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
