import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  PromoEditorForm,
  type PromoEditorInitial,
  type PromoFormType,
} from "@/components/admin/promo-banner-editor-forms";
import { requireAdminPage } from "@/lib/auth-session";
import { toJakartaDateTimeLocal } from "@/lib/jakarta-date-time";

export const metadata: Metadata = {
  title: "Ubah Promo - HappyTaste Resto",
  description: "Ubah promo pada panel pengelola HappyTaste Resto.",
};

const allowedPromoTypes: PromoFormType[] = ["discount", "free_item", "cashback"];

export default async function EditAdminPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  let promo: Awaited<ReturnType<typeof import("@/db/queries/promos").getPromoById>>;
  try {
    const { getPromoById } = await import("@/db/queries/promos");
    promo = await getPromoById(id);
  } catch (error) {
    console.error("Failed to load promo for editing", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Ubah promo</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Detail promo tidak dapat dimuat saat ini. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  if (!promo) notFound();
  const initialPromo: PromoEditorInitial = {
    id: promo.id,
    title: promo.title,
    description: promo.description,
    type: allowedPromoTypes.includes(promo.type as PromoFormType) ? promo.type as PromoFormType : "discount",
    value: promo.value,
    terms: promo.terms,
    startDateLocal: toJakartaDateTimeLocal(promo.startDate),
    endDateLocal: toJakartaDateTimeLocal(promo.endDate),
    isActive: promo.isActive,
  };

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Pemasaran</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Ubah promo</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Perbarui informasi {promo.title}.</p>
      </header>
      <PromoEditorForm initialPromo={initialPromo} />
    </main>
  );
}
