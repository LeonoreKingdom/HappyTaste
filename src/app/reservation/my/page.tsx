import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Armchair, Clock3, Users } from "lucide-react";

import {
  mockMemberReservations,
  mockReservationOutlets,
  mockReservationTableTypes,
} from "@/data/mock-reservations";

export const metadata: Metadata = {
  title: "Reservasi Saya (Demo) - HappyTaste Resto",
  description: "Lihat contoh daftar reservasi member dan statusnya.",
};

type ReservationStatus = (typeof mockMemberReservations)[number]["status"];

const statusPresentation: Record<
  ReservationStatus,
  { label: string; description: string; className: string; dotClassName: string }
> = {
  confirmed: {
    label: "Terkonfirmasi",
    description: "Contoh status: jadwal telah dikonfirmasi.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    dotClassName: "bg-emerald-600",
  },
  pending: {
    label: "Menunggu konfirmasi",
    description: "Contoh status: menunggu konfirmasi dari outlet.",
    className: "border-amber-200 bg-amber-50 text-amber-950",
    dotClassName: "bg-amber-600",
  },
  cancelled: {
    label: "Dibatalkan",
    description: "Contoh status: reservasi telah dibatalkan.",
    className: "border-stone-200 bg-stone-100 text-stone-700",
    dotClassName: "bg-stone-500",
  },
  completed: {
    label: "Selesai",
    description: "Contoh status: jadwal reservasi telah lewat.",
    className: "border-sky-200 bg-sky-50 text-sky-900",
    dotClassName: "bg-sky-600",
  },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function MyReservationsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/reservation"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke reservasi
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">DATA CONTOH MEMBER</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Reservasi saya
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Lihat jadwal contoh dan status reservasi pada halaman demo HappyTaste.
        </p>
      </header>

      <aside
        role="note"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
      >
        Akun member belum terhubung. Semua item di bawah adalah data tiruan; status tidak berasal
        dari server dan tidak mewakili reservasi yang benar-benar dibuat.
      </aside>

      <section aria-labelledby="my-reservations-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="my-reservations-title" className="text-xl font-bold text-stone-900">
              Daftar reservasi contoh
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {mockMemberReservations.length} contoh dengan status berbeda
            </p>
          </div>
          <Link
            href="/reservation"
            className="inline-flex items-center justify-center rounded-xl bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Buat preview reservasi
          </Link>
        </div>

        <ol className="grid gap-4">
          {mockMemberReservations.map((reservation) => {
            const outlet = mockReservationOutlets.find((item) => item.id === reservation.outletId);
            const tableType = mockReservationTableTypes.find(
              (item) => item.id === reservation.tableTypeId,
            );
            const presentation = statusPresentation[reservation.status];

            return (
              <li key={reservation.id}>
                <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-stone-950">
                        {dateFormatter.format(new Date(`${reservation.arrivalDate}T00:00:00.000Z`))}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {outlet?.name ?? "Outlet demo"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${presentation.className}`}
                    >
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${presentation.dotClassName}`} />
                      {presentation.label}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-3">
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                        <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
                        Waktu
                      </dt>
                      <dd className="mt-1 pl-6 text-sm font-semibold text-stone-900">
                        {reservation.arrivalTime}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                        <Users aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
                        Jumlah tamu
                      </dt>
                      <dd className="mt-1 pl-6 text-sm font-semibold text-stone-900">
                        {reservation.guestCount} orang
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                        <Armchair aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
                        Tipe meja
                      </dt>
                      <dd className="mt-1 pl-6 text-sm font-semibold text-stone-900">
                        {tableType?.label ?? "Meja demo"}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-sm leading-6 text-stone-600">{presentation.description}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke beranda
      </Link>
    </main>
  );
}
