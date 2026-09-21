import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ReservationEditForm } from "@/components/reservation/reservation-edit-form";
import {
  mockMemberReservations,
  mockReservationOutlets,
  mockReservationTableTypes,
} from "@/data/mock-reservations";

export const metadata: Metadata = {
  title: "Ubah Reservasi (Demo) - HappyTaste Resto",
  description: "Buat preview perubahan jadwal dan jumlah tamu reservasi demo.",
};

function ReservationEditUnavailable() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/reservation/my"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke reservasi saya
      </Link>
      <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-orange-700">PREVIEW TIDAK TERSEDIA</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
          Reservasi demo tidak dapat diubah
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Contoh ini tidak ditemukan atau statusnya tidak mendukung perubahan jadwal.
        </p>
        <Link
          href="/reservation/my"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          Kembali ke daftar reservasi
        </Link>
      </section>
    </main>
  );
}

export default async function EditReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = mockMemberReservations.find(
    (item) =>
      item.id === id && (item.status === "confirmed" || item.status === "pending"),
  );

  if (!reservation) {
    return <ReservationEditUnavailable />;
  }

  const outlet = mockReservationOutlets.find((item) => item.id === reservation.outletId);
  const tableType = mockReservationTableTypes.find((item) => item.id === reservation.tableTypeId);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/reservation/my"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke reservasi saya
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">UBAH RESERVASI DEMO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Ubah jadwal & jumlah tamu
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Tinjau pilihan baru untuk reservasi contoh di {outlet?.name ?? "outlet demo"}.
        </p>
      </header>

      <ReservationEditForm
        outletName={outlet?.name ?? "Outlet demo"}
        initialArrivalDate={reservation.arrivalDate}
        initialArrivalTime={reservation.arrivalTime}
        initialGuestCount={reservation.guestCount}
        initialTableTypeId={reservation.tableTypeId}
        initialTableTypeLabel={tableType?.label ?? "Meja demo"}
      />
    </main>
  );
}
