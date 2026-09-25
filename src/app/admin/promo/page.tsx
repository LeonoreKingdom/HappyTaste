import type { Metadata } from "next";
import { Megaphone, Tags } from "lucide-react";

import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Kelola Promo & Banner - HappyTaste Resto",
  description: "Daftar promo dan banner tersimpan untuk panel pengelola HappyTaste Resto.",
};

const promoTypeLabels: Record<string, string> = {
  discount: "Diskon",
  free_item: "Item gratis",
  cashback: "Cashback poin",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function getPromoStatus(promo: {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}, now: Date) {
  if (!promo.isActive) return { label: "Nonaktif", className: "bg-stone-100 text-stone-700 ring-stone-200" };
  if (promo.startDate > now) return { label: "Akan datang", className: "bg-sky-50 text-sky-800 ring-sky-200" };
  if (promo.endDate < now) return { label: "Kedaluwarsa", className: "bg-amber-50 text-amber-900 ring-amber-200" };
  return { label: "Aktif", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" };
}

function formatPromoValue(type: string, value: number) {
  if (type === "discount") return `${value}%`;
  if (type === "cashback") return `${value}× poin`;
  if (type === "free_item") return value > 0 ? `${value} item gratis` : "Item gratis";
  return String(value);
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${active ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-stone-100 text-stone-700 ring-stone-200"}`}>
      {label}
    </span>
  );
}

export default async function AdminPromoPage() {
  await requireAdminPage();

  let data: Awaited<ReturnType<typeof import("@/db/queries/promos").getAdminPromoOverview>>;
  try {
    const { getAdminPromoOverview } = await import("@/db/queries/promos");
    data = await getAdminPromoOverview();
  } catch (error) {
    console.error("Failed to load admin promo overview", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Promo &amp; banner</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Data promo dan banner tidak dapat dimuat saat ini. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  const now = new Date();
  const activePromoCount = data.promos.filter((promo) => {
    const status = getPromoStatus(promo, now);
    return status.label === "Aktif";
  }).length;
  const activeBannerCount = data.banners.filter((banner) => banner.isActive).length;

  return (
    <main className="space-y-5">
      <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Promo &amp; banner</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Konten yang ditampilkan berasal dari data tersimpan.</p>
        </div>
      </header>

      <section aria-label="Ringkasan promo dan banner" className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Tags aria-hidden="true" className="h-4 w-4 text-orange-700" />
            Promo aktif dan berlaku
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-950">{activePromoCount} <span className="text-sm font-medium text-stone-500">dari {data.promos.length}</span></p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Megaphone aria-hidden="true" className="h-4 w-4 text-orange-700" />
            Banner aktif
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-950">{activeBannerCount} <span className="text-sm font-medium text-stone-500">dari {data.banners.length}</span></p>
        </div>
      </section>

      <section aria-labelledby="admin-promos-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
          <h2 id="admin-promos-heading" className="text-lg font-bold text-stone-950">Daftar promo</h2>
          <p className="mt-1 text-sm text-stone-500">Status mempertimbangkan flag aktif dan rentang tanggal berlaku.</p>
        </div>
        {data.promos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <caption className="sr-only">Seluruh promo, termasuk nonaktif dan kedaluwarsa</caption>
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">Promo</th>
                  <th scope="col" className="px-4 py-3">Jenis</th>
                  <th scope="col" className="px-4 py-3">Nilai</th>
                  <th scope="col" className="px-4 py-3">Periode</th>
                  <th scope="col" className="px-5 py-3 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.promos.map((promo) => {
                  const status = getPromoStatus(promo, now);
                  const attachedBanners = promo.banners.length;

                  return (
                    <tr key={promo.id}>
                      <th scope="row" className="max-w-sm px-5 py-4 align-top sm:px-6">
                        <p className="font-semibold text-stone-900">{promo.title}</p>
                        <p className="mt-1 whitespace-normal text-xs leading-5 text-stone-500">{promo.description}</p>
                        <p className="mt-1 text-xs text-stone-400">{attachedBanners} banner terhubung</p>
                      </th>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">{promoTypeLabels[promo.type] ?? promo.type}</td>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">{formatPromoValue(promo.type, promo.value)}</td>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">
                        {dateFormatter.format(promo.startDate)} – {dateFormatter.format(promo.endDate)}
                      </td>
                      <td className="px-5 py-4 align-top sm:px-6">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="status" className="px-5 py-10 text-center sm:px-6">
            <Tags aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
            <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada promo tersimpan</h3>
          </div>
        )}
      </section>

      <section aria-labelledby="admin-banners-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
          <h2 id="admin-banners-heading" className="text-lg font-bold text-stone-950">Daftar banner</h2>
          <p className="mt-1 text-sm text-stone-500">Urutan dan status mengikuti pengaturan yang tersimpan.</p>
        </div>
        {data.banners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Seluruh banner pada sistem promo</caption>
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">Banner</th>
                  <th scope="col" className="px-4 py-3">Tujuan</th>
                  <th scope="col" className="px-4 py-3">Promo terkait</th>
                  <th scope="col" className="px-4 py-3">Urutan</th>
                  <th scope="col" className="px-5 py-3 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.banners.map((banner) => (
                  <tr key={banner.id}>
                    <th scope="row" className="px-5 py-4 font-semibold text-stone-900 sm:px-6">{banner.title}</th>
                    <td className="max-w-xs whitespace-normal px-4 py-4 text-stone-600">{banner.link}</td>
                    <td className="px-4 py-4 text-stone-600">{banner.promoTitle ?? "—"}</td>
                    <td className="px-4 py-4 text-stone-600">{banner.sortOrder}</td>
                    <td className="px-5 py-4 sm:px-6"><StatusBadge active={banner.isActive} label={banner.isActive ? "Aktif" : "Nonaktif"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="status" className="px-5 py-10 text-center sm:px-6">
            <Megaphone aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
            <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada banner tersimpan</h3>
          </div>
        )}
      </section>
    </main>
  );
}
