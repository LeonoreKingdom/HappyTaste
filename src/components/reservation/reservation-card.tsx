"use client";

import Link from "next/link";
import { Armchair, Clock3, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ReservationStatus = "confirmed" | "pending" | "cancelled" | "completed";

type ReservationCardProps = {
  reservationId: string;
  dateLabel: string;
  outletName: string;
  arrivalTime: string;
  guestCount: number;
  tableTypeLabel: string;
  initialStatus: ReservationStatus;
};

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

export function ReservationCard({
  reservationId,
  dateLabel,
  outletName,
  arrivalTime,
  guestCount,
  tableTypeLabel,
  initialStatus,
}: ReservationCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasCancelledLocally, setWasCancelledLocally] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const presentation = statusPresentation[status];
  const canManage = status === "confirmed" || status === "pending";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isDialogOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [isDialogOpen]);

  function closeDialog() {
    setIsDialogOpen(false);
  }

  function confirmCancellation() {
    setStatus("cancelled");
    setWasCancelledLocally(true);
    closeDialog();
  }

  return (
    <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-950">{dateLabel}</h3>
          <p className="mt-1 text-sm text-stone-600">{outletName}</p>
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
          <dd className="mt-1 pl-6 text-sm font-semibold text-stone-900">{arrivalTime}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            <Users aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
            Jumlah tamu
          </dt>
          <dd className="mt-1 pl-6 text-sm font-semibold text-stone-900">{guestCount} orang</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            <Armchair aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
            Tipe meja
          </dt>
          <dd className="mt-1 pl-6 text-sm font-semibold text-stone-900">{tableTypeLabel}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-6 text-stone-600">
        {wasCancelledLocally
          ? "Status berubah hanya pada preview lokal; data reservasi tidak disimpan."
          : presentation.description}
      </p>

      {wasCancelledLocally ? (
        <p role="status" className="sr-only">
          Reservasi demo dibatalkan pada preview lokal. Perubahan tidak disimpan.
        </p>
      ) : null}

      {canManage ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/reservation/my/edit/${reservationId}`}
            className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-900 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Ubah jadwal demo
          </Link>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
          >
            Batalkan demo
          </button>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby={`cancel-reservation-title-${reservationId}`}
        aria-describedby={`cancel-reservation-description-${reservationId}`}
        onCancel={closeDialog}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-black/60"
      >
        <div className="p-6 sm:p-7">
          <p className="text-sm font-semibold tracking-wide text-rose-700">KONFIRMASI DEMO</p>
          <h2
            id={`cancel-reservation-title-${reservationId}`}
            className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            Batalkan reservasi ini?
          </h2>
          <p
            id={`cancel-reservation-description-${reservationId}`}
            className="mt-3 text-sm leading-6 text-stone-600"
          >
            Reservasi {dateLabel} pukul {arrivalTime} di {outletName} akan ditandai dibatalkan pada
            preview ini.
          </p>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Ini hanya simulasi. Status berubah di tampilan sampai halaman dimuat ulang; tidak ada
            data yang dikirim atau disimpan.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              autoFocus
              onClick={closeDialog}
              className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-200"
            >
              Jangan dulu
            </button>
            <button
              type="button"
              onClick={confirmCancellation}
              className="inline-flex items-center justify-center rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
            >
              Ya, batalkan demo
            </button>
          </div>
        </div>
      </dialog>
    </article>
  );
}
