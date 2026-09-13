import Link from "next/link";
import { notFound } from "next/navigation";
import { mockPromos } from "@/data/mock-promos";
import { ArrowLeft, Tag, Calendar, CheckCircle2, AlertCircle, Share2 } from "lucide-react";

interface PromoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PromoDetailPage({ params }: PromoDetailPageProps) {
  const { id } = await params;
  const promo = mockPromos.find((p) => p.id === id);

  if (!promo) {
    notFound();
  }

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* Hero Promo Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-orange-100 bg-white">
        <div className="h-64 sm:h-80 md:h-96 w-full relative overflow-hidden bg-orange-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.bannerUrl}
            alt={promo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600 text-xs font-bold shadow">
              <Tag className="w-3.5 h-3.5" />
              <span>
                {promo.type === "discount"
                  ? `Diskon ${promo.value}%`
                  : promo.type === "cashback"
                  ? `Poin ${promo.value}%`
                  : "Menu Gratis"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {promo.title}
            </h1>
          </div>
        </div>

        {/* Promo Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Validity Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-orange-50 border border-orange-200/60 text-sm text-orange-950">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>
                Periode Promo: <strong>{startDateFormatted}</strong> s.d.{" "}
                <strong>{endDateFormatted}</strong>
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Aktif
            </span>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Tentang Promo</h2>
            <p className="text-gray-700 leading-relaxed">{promo.description}</p>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>Syarat & Ketentuan</span>
            </h2>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 space-y-2">
              <p>{promo.terms}</p>
              <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 pt-2">
                <li>Tunjukkan aplikasi / halaman promo ini ke staf kasir HappyTaste saat memesan.</li>
                <li>Khusus untuk pemesanan dine-in & order in advance bagi member HappyTaste.</li>
                <li>HappyTaste berhak mengubah syarat & ketentuan tanpa pemberitahuan sebelumnya.</li>
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-4 items-center justify-between">
            <Link
              href="/menu"
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gunakan Promo di Menu</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Lihat Promo Lainnya</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
