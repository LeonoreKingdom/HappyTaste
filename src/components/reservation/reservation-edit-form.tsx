"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { ArrivalScheduleStep } from "@/components/reservation/arrival-schedule-step";
import { GuestAndTableStep } from "@/components/reservation/guest-and-table-step";
import {
  mockReservationTableTypes,
  mockReservationTimeSlots,
} from "@/data/mock-reservations";

type ReservationEditFormProps = {
  outletName: string;
  initialArrivalDate: string;
  initialArrivalTime: string;
  initialGuestCount: number;
  initialTableTypeId: string;
  initialTableTypeLabel: string;
};

type ReservationEditPreview = {
  arrivalDate: string;
  arrivalTime: string;
  guestCount: number;
  tableTypeLabel: string;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function isFutureArrival(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime() > Date.now();
}

export function ReservationEditForm({
  outletName,
  initialArrivalDate,
  initialArrivalTime,
  initialGuestCount,
  initialTableTypeId,
  initialTableTypeLabel,
}: ReservationEditFormProps) {
  const [arrivalDate, setArrivalDate] = useState(initialArrivalDate);
  const [arrivalTime, setArrivalTime] = useState(initialArrivalTime);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [tableTypeId, setTableTypeId] = useState(initialTableTypeId);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ReservationEditPreview | null>(null);

  const availableTableTypes = mockReservationTableTypes.filter(
    (tableType) => guestCount >= tableType.minGuests && guestCount <= tableType.maxGuests,
  );
  const selectedTableType =
    availableTableTypes.find((tableType) => tableType.id === tableTypeId) ??
    availableTableTypes[0];

  function clearFeedback() {
    setError("");
    setPreview(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFutureArrival(arrivalDate, arrivalTime)) {
      setError("Pilih tanggal dan waktu kedatangan yang akan datang.");
      setPreview(null);
      return;
    }

    if (!selectedTableType) {
      setError("Belum ada tipe meja yang cocok untuk jumlah tamu tersebut.");
      setPreview(null);
      return;
    }

    setError("");
    setPreview({
      arrivalDate,
      arrivalTime,
      guestCount,
      tableTypeLabel: selectedTableType.label,
    });
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section
        aria-labelledby="reservation-edit-form-title"
        className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold text-orange-700">RESERVASI DEMO</p>
          <h2 id="reservation-edit-form-title" className="mt-1 text-xl font-bold text-stone-900">
            Perbarui pilihan kunjungan
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ArrivalScheduleStep
            date={arrivalDate}
            time={arrivalTime}
            timeSlots={mockReservationTimeSlots}
            onDateChange={(date) => {
              setArrivalDate(date);
              clearFeedback();
            }}
            onTimeChange={(time) => {
              setArrivalTime(time);
              clearFeedback();
            }}
          />
          <GuestAndTableStep
            guestCount={guestCount}
            tableTypes={availableTableTypes}
            selectedTableTypeId={selectedTableType?.id}
            onGuestCountChange={(count) => {
              setGuestCount(count);
              clearFeedback();
            }}
            onTableTypeChange={(nextTableTypeId) => {
              setTableTypeId(nextTableTypeId);
              clearFeedback();
            }}
          />

          {error ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Tampilkan preview perubahan
          </button>
        </form>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <section
          aria-labelledby="reservation-original-title"
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-stone-500">PILIHAN SAAT INI · DEMO</p>
          <h2 id="reservation-original-title" className="mt-1 text-lg font-bold text-stone-900">
            {outletName}
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tanggal</dt>
              <dd className="mt-1 font-semibold text-stone-900">
                {dateFormatter.format(new Date(`${initialArrivalDate}T00:00:00`))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Waktu</dt>
              <dd className="mt-1 font-semibold text-stone-900">{initialArrivalTime}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tamu</dt>
              <dd className="mt-1 font-semibold text-stone-900">{initialGuestCount} orang</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Meja</dt>
              <dd className="mt-1 font-semibold text-stone-900">{initialTableTypeLabel}</dd>
            </div>
          </dl>
        </section>

        {preview ? (
          <section
            aria-labelledby="reservation-edit-preview-title"
            className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-emerald-800">PREVIEW PERUBAHAN</p>
            <h2 id="reservation-edit-preview-title" className="mt-1 text-lg font-bold text-stone-900">
              Pilihan baru
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tanggal</dt>
                <dd className="mt-1 font-semibold text-stone-900">
                  {dateFormatter.format(new Date(`${preview.arrivalDate}T00:00:00`))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Waktu</dt>
                <dd className="mt-1 font-semibold text-stone-900">{preview.arrivalTime}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tamu</dt>
                <dd className="mt-1 font-semibold text-stone-900">{preview.guestCount} orang</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Meja</dt>
                <dd className="mt-1 font-semibold text-stone-900">{preview.tableTypeLabel}</dd>
              </div>
            </dl>
            <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Perubahan ini hanya preview lokal. Daftar reservasi tidak berubah dan tidak ada data yang disimpan.
            </p>
            <Link
              href="/reservation/my"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-3 text-center font-semibold text-orange-900 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Kembali ke daftar reservasi
            </Link>
          </section>
        ) : (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            Ubah jadwal atau jumlah tamu untuk melihat preview. Perubahan tidak akan diterapkan pada daftar demo.
          </p>
        )}
      </aside>
    </div>
  );
}
