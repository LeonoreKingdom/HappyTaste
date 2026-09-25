import type { Metadata } from "next";

import { BannerEditorForm } from "@/components/admin/promo-banner-editor-forms";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Tambah Banner - HappyTaste Resto",
  description: "Tambahkan banner ke panel pengelola HappyTaste Resto.",
};

type PromoOption = { id: string; title: string };

export default async function AddAdminBannerPage() {
  await requireAdminPage();

  let promos: PromoOption[];
  try {
    const { getAllPromos } = await import("@/db/queries/promos");
    promos = await getAllPromos();
  } catch (error) {
    console.error("Failed to load promos for banner form", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Tambah banner</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Form banner tidak dapat dimuat saat ini. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Tambah banner</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Atur gambar, tujuan internal, promo terkait, dan urutan tampil.</p>
      </header>
      <BannerEditorForm promos={promos} />
    </main>
  );
}
