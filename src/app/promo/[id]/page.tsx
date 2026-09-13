import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activePromos, getPromoBadgeLabel } from "@/data/mock-promos";
import {
  ArrowLeft,
  Tag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface PromoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PromoDetailPage({ params }: PromoDetailPageProps) {
  const { id } = await params;
  const promo = activePromos.find((p) => p.id === id);

  if (!promo) {
    notFound();
  }

  const otherPromos = activePromos.filter((p) => p.id !== id);

  const startDateFormatted = new Date(promo.startDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDateFormatted = new Date(promo.endDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/promo" className="hover:text-orange-600 transition-colors">
          Promo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md">
          {promo.title}
        </span>
      </nav>

      {/* Hero Promo Header Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-orange-100 bg-white">
        <div className="h-64 sm:h-80 md:h-96 w-full relative overflow-hidden bg-orange-950">
          <Image
            src={promo.bannerUrl}
            alt={promo.title}
            fill
            sizes="(min-width: 768px) 896px, 100vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600 text-xs font-bold shadow">
                <Tag className="w-3.5 h-3.5" />
                {getPromoBadgeLabel(promo)}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur text-white text-xs font-semibold">
                Promo Aktif
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {promo.title}
            </h1>
          </div>
        </div>

        {/* Details & Information */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Validity & Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-orange-50/70 border border-orange-200/60 text-sm">
            <div className="flex items-start gap-3 text-orange-950">
              <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-orange-700 font-semibold block">
                  Periode Berlaku
                </span>
                <span className="font-medium">
                  {startDateFormatted} – {endDateFormatted}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-orange-950">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-orange-700 font-semibold block">
                  Waktu Pemakaian
                </span>
                <span className="font-medium">
                  Setiap jam operasional outlet resto
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span>Deskripsi Penawaran</span>
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {promo.description}
            </p>
          </div>

          {/* How to Use */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Cara Menggunakan Promo</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-gray-700">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h3 className="font-bold text-gray-900">Pilih Promo</h3>
                <p className="text-gray-500 text-xs">
                  Pilih penawaran yang sesuai dengan kebutuhanmu.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h3 className="font-bold text-gray-900">Baca Syarat</h3>
                <p className="text-gray-500 text-xs">
                  Pastikan masa berlaku dan ketentuan promo sudah sesuai.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h3 className="font-bold text-gray-900">Nikmati Promo</h3>
                <p className="text-gray-500 text-xs">
                  Tunjukkan promo sesuai alur pemesanan HappyTaste.
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions (Syarat & Ketentuan) */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>Syarat & Ketentuan Lengkap</span>
            </h2>
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 space-y-3">
              <p className="font-medium text-gray-900">{promo.terms}</p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1.5">
                <li>
                  Promo berlaku untuk semua outlet HappyTaste yang sedang beroperasi.
                </li>
                <li>
                  Hanya dapat digunakan 1 (satu) kali transaksi per akun member per hari.
                </li>
                <li>
                  Tidak dapat digabungkan dengan promo paket diskon kombo lainnya.
                </li>
                <li>
                  Poin loyalitas tetap dihitung dari nilai total setelah potongan promo.
                </li>
                <li>
                  Manajemen HappyTaste berhak membatalkan pesanan atau promo jika terindikasi adanya kecurangan.
                </li>
              </ul>
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Jaminan keaslian promo resmi HappyTaste Resto</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-wrap gap-4 items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/menu"
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Jelajahi Menu</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Other Active Promos */}
      {otherPromos.length > 0 && (
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Promo Menarik Lainnya
            </h2>
            <Link
              href="/promo"
              className="text-xs sm:text-sm font-semibold text-orange-600 hover:underline"
            >
              Lihat Semua Promo &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherPromos.map((item) => (
              <Link
                key={item.id}
                href={`/promo/${item.id}`}
                className="group flex gap-4 p-4 rounded-xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-orange-100">
                  <Image
                    src={item.bannerUrl}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-between space-y-1">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase">
                      {item.type}
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                    Detail Syarat &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
