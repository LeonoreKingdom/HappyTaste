import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ReservationCard } from "@/components/reservation/reservation-card";

import {
  mockMemberReservations,
  mockReservationOutlets,
  mockReservationTableTypes,
} from "@/data/mock-reservations";

export const metadata: Metadata = {
  title: "Reservasi Saya (Demo) - HappyTaste Resto",
  description: "Lihat contoh daftar reservasi member dan statusnya.",
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

            return (
              <li key={reservation.id}>
                <ReservationCard
                  reservationId={reservation.id}
                  dateLabel={dateFormatter.format(
                    new Date(`${reservation.arrivalDate}T00:00:00.000Z`),
                  )}
                  outletName={outlet?.name ?? "Outlet demo"}
                  arrivalTime={reservation.arrivalTime}
                  guestCount={reservation.guestCount}
                  tableTypeLabel={tableType?.label ?? "Meja demo"}
                  initialStatus={reservation.status}
                />
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
