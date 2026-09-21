import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CircleCheck, Info } from "lucide-react";

import {
  mockReservationOutlets,
  mockReservationTableTypes,
  mockReservationTimeSlots,
} from "@/data/mock-reservations";

export const metadata: Metadata = {
  title: "Konfirmasi Reservasi Demo - HappyTaste Resto",
  description: "Tinjau ringkasan preview reservasi meja HappyTaste.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ReservationSummary = {
  outletName: string;
  date: string;
  time: string;
  guestCount: number;
  tableType: string;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
}

function parseReservationSummary(params: Record<string, string | string[] | undefined>) {
  const date = getSingleValue(params.date);
  const time = getSingleValue(params.time);
  const guests = getSingleValue(params.guests);
  const outletId = getSingleValue(params.outlet);
  const tableTypeId = getSingleValue(params.table);
  const guestCount = guests && /^\d{1,2}$/.test(guests) ? Number(guests) : Number.NaN;

  if (
    !date ||
    !isValidDate(date) ||
    !time ||
    !mockReservationTimeSlots.some((slot) => slot === time) ||
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > 8 ||
    !outletId ||
    !tableTypeId
  ) {
    return null;
  }

  const outlet = mockReservationOutlets.find((item) => item.id === outletId);
  const tableType = mockReservationTableTypes.find(
    (item) =>
      item.id === tableTypeId && guestCount >= item.minGuests && guestCount <= item.maxGuests,
  );

  if (!outlet || !tableType) {
    return null;
  }

  return {
    outletName: outlet.name,
    date,
    time,
    guestCount,
    tableType: tableType.label,
  } satisfies ReservationSummary;
}

const reservationDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function ConfirmationUnavailable() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/reservation"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke reservasi
      </Link>
      <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-orange-700">PREVIEW TIDAK TERSEDIA</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
          Ringkasan reservasi tidak lengkap
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Pilihan jadwal atau meja tidak valid. Kembali ke formulir untuk membuat preview baru.
        </p>
        <Link
          href="/reservation"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          Buat preview baru
        </Link>
      </section>
    </main>
  );
}

export default async function ReservationConfirmationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const reservation = parseReservationSummary(await searchParams);

  if (!reservation) {
    return <ConfirmationUnavailable />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/reservation"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke reservasi
      </Link>

      <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <CircleCheck aria-hidden="true" className="h-7 w-7" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-800">PREVIEW KONFIRMASI</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
              Ringkasan reservasi siap ditinjau
            </h1>
            <p className="mt-3 leading-7 text-stone-600">
              Pilihan jadwal dan meja demo berhasil dirangkum. Belum ada reservasi yang dikirim.
            </p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm sm:p-5">
          <div className="col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Outlet</dt>
            <dd className="mt-1 font-semibold text-stone-900">{reservation.outletName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tanggal</dt>
            <dd className="mt-1 font-semibold text-stone-900">
              {reservationDateFormatter.format(new Date(`${reservation.date}T00:00:00.000Z`))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Waktu</dt>
            <dd className="mt-1 font-semibold text-stone-900">{reservation.time}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Jumlah tamu</dt>
            <dd className="mt-1 font-semibold text-stone-900">{reservation.guestCount} orang</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tipe meja</dt>
            <dd className="mt-1 font-semibold text-stone-900">{reservation.tableType}</dd>
          </div>
        </dl>

        <p role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          Ini hanya preview antarmuka. Ketersediaan belum diperiksa, meja belum dipesan, dan data tidak dikirim atau disimpan.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/reservation"
            className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-3 text-center font-semibold text-orange-900 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Ubah pilihan
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-orange-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
