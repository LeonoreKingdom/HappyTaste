import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  MapPin,
  ShoppingBag,
  Sparkles,
  Tag,
  Utensils,
} from "lucide-react";

import { MenuBrowser } from "@/components/menu/menu-browser";
import { PromoCarousel } from "@/components/promo/promo-carousel";
import { PromoPopupDialog } from "@/components/promo/promo-popup-dialog";
import {
  activeBanners,
  activePromos,
  getPromoBadgeLabel,
} from "@/data/mock-promos";

export default function HomePage() {
  const featuredPromo = activePromos[0];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-14 px-5 py-8 sm:px-8 sm:py-12">
      {featuredPromo ? <PromoPopupDialog promo={featuredPromo} /> : null}

      <section aria-labelledby="promo-hero-title">
        <h1 id="promo-hero-title" className="sr-only">
          Promo HappyTaste Resto
        </h1>
        <PromoCarousel banners={activeBanners} promos={activePromos} />
      </section>

      <section aria-label="Akses cepat" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/menu"
          className="group flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 transition-colors group-hover:text-orange-600">
              Jelajah Menu
            </h2>
            <p className="text-xs text-gray-500">Pilihan hidangan lezat resto</p>
          </div>
        </Link>

        <Link
          href="/promo"
          className="group flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 transition-colors group-hover:text-amber-600">
              Lihat Semua Promo
            </h2>
            <p className="text-xs text-gray-500">Penawaran spesial HappyTaste</p>
          </div>
        </Link>

        <Link
          href="/order"
          className="group flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-800 group-hover:text-white">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 transition-colors group-hover:text-orange-600">
              Pesan Makanan
            </h2>
            <p className="text-xs text-gray-500">Susun pesanan favoritmu</p>
          </div>
        </Link>

        <Link
          href="/reservation"
          className="group flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 transition-colors group-hover:text-emerald-700">
              Reservasi Meja
            </h2>
            <p className="text-xs text-gray-500">Atur jadwal kunjungan member</p>
          </div>
        </Link>

        <Link
          href="/lokasi-kontak"
          className="group flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-colors group-hover:bg-sky-700 group-hover:text-white">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 transition-colors group-hover:text-sky-700">
              Lokasi & Kontak
            </h2>
            <p className="text-xs text-gray-500">Informasi outlet HappyTaste</p>
          </div>
        </Link>
      </section>

      <MenuBrowser idPrefix="home-menu" />

      {activePromos.length > 0 ? (
        <section aria-labelledby="promo-list-title" className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                <Sparkles className="h-4 w-4" />
                <span>Penawaran Terbatas</span>
              </div>
              <h2 id="promo-list-title" className="text-2xl font-bold text-gray-900">
                Promo Menarik Minggu Ini
              </h2>
            </div>
            <Link
              href="/promo"
              className="flex items-center gap-1 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {activePromos.map((promo) => (
              <article
                key={promo.id}
                className="flex flex-col overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <Link href={`/promo/${promo.id}`} className="group block">
                  <div className="relative h-44 overflow-hidden bg-orange-100">
                    <Image
                      src={promo.bannerUrl}
                      alt={promo.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
                      <Tag className="h-3 w-3" />
                      <span>{getPromoBadgeLabel(promo)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-600">
                      {promo.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {promo.description}
                    </p>
                  </div>
                </Link>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
                  <span>
                    Berlaku s.d. {new Date(promo.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/promo/${promo.id}`}
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    Detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white shadow-md sm:flex-row">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            <span>HappyTaste Loyalty Club</span>
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Nikmati Menu Favorit dan Promo HappyTaste
          </h2>
          <p className="max-w-lg text-sm text-amber-100">
            Jelajahi pilihan hidangan kami dan temukan penawaran yang cocok untuk
            momen makanmu hari ini.
          </p>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-600 shadow-lg transition-transform hover:bg-orange-50 active:scale-95"
        >
          <Utensils className="h-4 w-4" />
          <span>Lihat Menu</span>
        </Link>
      </section>
    </main>
  );
}
