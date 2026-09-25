import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BannerEditorForm,
  type BannerEditorInitial,
} from "@/components/admin/promo-banner-editor-forms";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Ubah Banner - HappyTaste Resto",
  description: "Ubah banner pada panel pengelola HappyTaste Resto.",
};

type PromoOption = { id: string; title: string };

export default async function EditAdminBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  let banner: Awaited<ReturnType<typeof import("@/db/queries/promos").getAdminBannerById>>;
  let promos: PromoOption[];
  try {
    const { getAdminBannerById, getAllPromos } = await import("@/db/queries/promos");
    [banner, promos] = await Promise.all([getAdminBannerById(id), getAllPromos()]);
  } catch (error) {
    console.error("Failed to load banner for editing", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Ubah banner</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Detail banner tidak dapat dimuat saat ini. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  if (!banner) notFound();
  const initialBanner: BannerEditorInitial = {
    id: banner.id,
    title: banner.title,
    imageUrl: banner.imageUrl,
    link: banner.link,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
    promoId: banner.promoId,
  };

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Ubah banner</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Perbarui {banner.title} dan urutan tampilnya.</p>
      </header>
      <BannerEditorForm promos={promos} initialBanner={initialBanner} />
    </main>
  );
}
