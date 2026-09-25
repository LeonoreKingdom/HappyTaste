import type { Metadata } from "next";

import { PromoEditorForm } from "@/components/admin/promo-banner-editor-forms";
import { requireAdminPage } from "@/lib/auth-session";
import { toJakartaDateTimeLocal } from "@/lib/jakarta-date-time";

export const metadata: Metadata = {
  title: "Tambah Promo - HappyTaste Resto",
  description: "Tambahkan promo ke panel pengelola HappyTaste Resto.",
};

export default async function AddAdminPromoPage() {
  await requireAdminPage();
  const now = new Date();

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Tambah promo</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Tanggal dan waktu menggunakan zona waktu WIB.</p>
      </header>
      <PromoEditorForm
        initialDates={{
          startDateLocal: toJakartaDateTimeLocal(now),
          endDateLocal: toJakartaDateTimeLocal(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
        }}
      />
    </main>
  );
}
