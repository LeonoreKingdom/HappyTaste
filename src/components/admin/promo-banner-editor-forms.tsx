"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const promoFormTypes = ["discount", "free_item", "cashback"] as const;
export type PromoFormType = (typeof promoFormTypes)[number];

export type PromoEditorInitial = {
  id: string;
  title: string;
  description: string;
  type: PromoFormType;
  value: number;
  terms: string;
  startDateLocal: string;
  endDateLocal: string;
  isActive: boolean;
};

export type BannerEditorInitial = {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
  promoId: string | null;
};

type PromoOption = { id: string; title: string };

function jakartaLocalDateToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const dateTime = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${dateTime}+07:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      {message}
    </div>
  );
}

export function PromoEditorForm({
  initialPromo,
  initialDates,
}: {
  initialPromo?: PromoEditorInitial;
  initialDates?: { startDateLocal: string; endDateLocal: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPromo?.title ?? "");
  const [description, setDescription] = useState(initialPromo?.description ?? "");
  const [type, setType] = useState<PromoFormType>(initialPromo?.type ?? "discount");
  const [value, setValue] = useState(String(initialPromo?.value ?? 0));
  const [terms, setTerms] = useState(initialPromo?.terms ?? "");
  const [startDate, setStartDate] = useState(initialPromo?.startDateLocal ?? initialDates?.startDateLocal ?? "");
  const [endDate, setEndDate] = useState(initialPromo?.endDateLocal ?? initialDates?.endDateLocal ?? "");
  const [isActive, setIsActive] = useState(initialPromo?.isActive ?? true);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const startDateIso = jakartaLocalDateToIso(startDate);
    const endDateIso = jakartaLocalDateToIso(endDate);
    if (!startDateIso || !endDateIso) {
      setErrorMessage("Masukkan tanggal mulai dan selesai yang valid dalam WIB.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(
          initialPromo ? `/api/admin/promos/${encodeURIComponent(initialPromo.id)}` : "/api/admin/promos",
          {
            method: initialPromo ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description,
              type,
              value: Number(value),
              terms,
              startDate: startDateIso,
              endDate: endDateIso,
              isActive,
            }),
          },
        );
        const result: { success?: boolean; error?: string } = await response.json();
        if (!response.ok || !result.success) {
          setErrorMessage(result.error ?? "Promo tidak dapat disimpan. Periksa kembali data yang diisi.");
          return;
        }

        router.push("/admin/promo");
        router.refresh();
      } catch {
        setErrorMessage("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <ErrorNotice message={errorMessage} />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="promo-title" className="mb-1.5 block text-sm font-semibold text-stone-800">Judul promo</label>
          <input id="promo-title" type="text" maxLength={120} required value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="promo-description" className="mb-1.5 block text-sm font-semibold text-stone-800">Deskripsi</label>
          <textarea id="promo-description" rows={3} maxLength={1000} required value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
        <div>
          <label htmlFor="promo-type" className="mb-1.5 block text-sm font-semibold text-stone-800">Jenis promo</label>
          <select id="promo-type" required value={type} onChange={(event) => { const nextType = event.target.value as PromoFormType; setType(nextType); if (nextType === "free_item") setValue("0"); }} className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
            <option value="discount">Diskon</option>
            <option value="free_item">Item gratis</option>
            <option value="cashback">Cashback poin</option>
          </select>
        </div>
        <div>
          <label htmlFor="promo-value" className="mb-1.5 block text-sm font-semibold text-stone-800">
            {type === "discount" ? "Nilai diskon (%)" : type === "cashback" ? "Pengali poin" : "Jumlah item gratis (0 bila tidak ditentukan)"}
          </label>
          <input id="promo-value" type="number" min="0" step="1" required value={value} onChange={(event) => setValue(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
        <div>
          <label htmlFor="promo-start" className="mb-1.5 block text-sm font-semibold text-stone-800">Mulai berlaku (WIB)</label>
          <input id="promo-start" type="datetime-local" step="60" required value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
        <div>
          <label htmlFor="promo-end" className="mb-1.5 block text-sm font-semibold text-stone-800">Selesai berlaku (WIB)</label>
          <input id="promo-end" type="datetime-local" step="60" required value={endDate} onChange={(event) => setEndDate(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="promo-terms" className="mb-1.5 block text-sm font-semibold text-stone-800">Syarat dan ketentuan</label>
          <textarea id="promo-terms" rows={4} maxLength={5000} required value={terms} onChange={(event) => setTerms(event.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-3 border-t border-stone-100 pt-4 text-sm font-semibold text-stone-800">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border-stone-300 accent-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        Promo aktif
      </label>
      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:justify-end">
        <Link href="/admin/promo" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">Batal</Link>
        <button type="submit" disabled={isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-5 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Menyimpan…" : initialPromo ? "Simpan perubahan" : "Simpan promo"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{isPending ? "Menyimpan promo." : ""}</p>
    </form>
  );
}

export function BannerEditorForm({
  promos,
  initialBanner,
}: {
  promos: PromoOption[];
  initialBanner?: BannerEditorInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialBanner?.title ?? "");
  const [imageUrl, setImageUrl] = useState(initialBanner?.imageUrl ?? "");
  const [link, setLink] = useState(initialBanner?.link ?? "");
  const [sortOrder, setSortOrder] = useState(String(initialBanner?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initialBanner?.isActive ?? true);
  const [promoId, setPromoId] = useState(initialBanner?.promoId ?? "");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(
          initialBanner ? `/api/admin/banners/${encodeURIComponent(initialBanner.id)}` : "/api/admin/banners",
          {
            method: initialBanner ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              imageUrl,
              link,
              sortOrder: Number(sortOrder),
              isActive,
              promoId: promoId || null,
            }),
          },
        );
        const result: { success?: boolean; error?: string } = await response.json();
        if (!response.ok || !result.success) {
          setErrorMessage(result.error ?? "Banner tidak dapat disimpan. Periksa kembali data yang diisi.");
          return;
        }

        router.push("/admin/promo");
        router.refresh();
      } catch {
        setErrorMessage("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <ErrorNotice message={errorMessage} />
      {promos.length === 0 && (
        <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          Belum ada promo untuk ditautkan. Banner tetap dapat disimpan tanpa promo terkait.
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="banner-title" className="mb-1.5 block text-sm font-semibold text-stone-800">Judul banner</label>
          <input id="banner-title" type="text" maxLength={120} required value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="banner-image" className="mb-1.5 block text-sm font-semibold text-stone-800">URL gambar</label>
          <input id="banner-image" type="text" maxLength={2048} required value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://images.unsplash.com/... atau /images/banner.jpg" className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
          <p className="mt-1 text-xs text-stone-500">Gunakan HTTPS images.unsplash.com atau path gambar lokal.</p>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="banner-link" className="mb-1.5 block text-sm font-semibold text-stone-800">Tujuan internal</label>
          <input id="banner-link" type="text" maxLength={2048} required value={link} onChange={(event) => setLink(event.target.value)} placeholder="/promo/promo-1" className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
          <p className="mt-1 text-xs text-stone-500">Gunakan path di dalam aplikasi, misalnya /promo/promo-1.</p>
        </div>
        <div>
          <label htmlFor="banner-order" className="mb-1.5 block text-sm font-semibold text-stone-800">Urutan tampil</label>
          <input id="banner-order" type="number" min="0" max="100000" step="1" required value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
          <p className="mt-1 text-xs text-stone-500">Angka lebih kecil ditampilkan lebih dahulu.</p>
        </div>
        <div>
          <label htmlFor="banner-promo" className="mb-1.5 block text-sm font-semibold text-stone-800">Promo terkait (opsional)</label>
          <select id="banner-promo" value={promoId} onChange={(event) => setPromoId(event.target.value)} className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
            <option value="">Tanpa promo terkait</option>
            {promos.map((promo) => (
              <option key={promo.id} value={promo.id}>{promo.title}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-3 border-t border-stone-100 pt-4 text-sm font-semibold text-stone-800">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border-stone-300 accent-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200" />
        Banner aktif
      </label>
      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:justify-end">
        <Link href="/admin/promo" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">Batal</Link>
        <button type="submit" disabled={isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-5 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Menyimpan…" : initialBanner ? "Simpan perubahan" : "Simpan banner"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{isPending ? "Menyimpan banner." : ""}</p>
    </form>
  );
}
