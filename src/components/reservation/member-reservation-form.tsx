"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  Armchair,
  ArrowLeft,
  Check,
  Info,
  MapPin,
  Users,
} from "lucide-react";

import { ArrivalScheduleStep } from "@/components/reservation/arrival-schedule-step";
import {
  mockReservationOutlets,
  mockReservationTableTypes,
  mockReservationTimeSlots,
} from "@/data/mock-reservations";

type ReservationPreview = {
  outletName: string;
  arrivalDate: string;
  arrivalTime: string;
  guestCount: number;
  tableType: string;
};

type ReservationStep = 1 | 2;

const guestOptions = Array.from({ length: 8 }, (_, index) => index + 1);

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
});

function isFutureReservation(date: string, time: string) {
  const selectedArrival = new Date(`${date}T${time}:00`);
  return selectedArrival.getTime() > new Date().getTime();
}

export function MemberReservationForm() {
  const [outletId, setOutletId] = useState<string>(mockReservationOutlets[0].id);
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState<string>(mockReservationTimeSlots[0]);
  const [guestCount, setGuestCount] = useState(2);
  const [tableTypeId, setTableTypeId] = useState<string>(mockReservationTableTypes[0].id);
  const [currentStep, setCurrentStep] = useState<ReservationStep>(1);
  const [formError, setFormError] = useState("");
  const [preview, setPreview] = useState<ReservationPreview | null>(null);

  const selectedOutlet = mockReservationOutlets.find((outlet) => outlet.id === outletId);
  const availableTableTypes = mockReservationTableTypes.filter(
    (tableType) => guestCount >= tableType.minGuests && guestCount <= tableType.maxGuests,
  );
  const selectedTableType =
    availableTableTypes.find((tableType) => tableType.id === tableTypeId) ??
    availableTableTypes[0];

  function clearFeedback() {
    setFormError("");
    setPreview(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFutureReservation(arrivalDate, arrivalTime)) {
      setFormError("Pilih tanggal dan waktu kunjungan yang akan datang.");
      setPreview(null);
      return;
    }

    if (currentStep === 1) {
      setFormError("");
      setPreview(null);
      setCurrentStep(2);
      return;
    }

    if (!selectedOutlet || !selectedTableType) {
      setFormError("Pilih outlet dan jenis meja yang sesuai dengan jumlah tamu.");
      setPreview(null);
      return;
    }

    setFormError("");
    setPreview({
      outletName: selectedOutlet.name,
      arrivalDate,
      arrivalTime,
      guestCount,
      tableType: selectedTableType.label,
    });
  }

  function resetForm() {
    setOutletId(mockReservationOutlets[0].id);
    setArrivalDate("");
    setArrivalTime(mockReservationTimeSlots[0]);
    setGuestCount(2);
    setTableTypeId(mockReservationTableTypes[0].id);
    setCurrentStep(1);
    setFormError("");
    setPreview(null);
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke beranda
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          KHUSUS MEMBER · DATA DEMO
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Reservasi meja
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Pilih outlet, jadwal kunjungan, jumlah tamu, dan tipe meja. Form ini hanya
          menampilkan preview lokal; belum ada meja yang dipesan.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="reservation-form-title"
          className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6">
            <p className="text-sm font-semibold text-orange-700">RANCANG KUNJUNGAN</p>
            <h2 id="reservation-form-title" className="mt-1 text-xl font-bold text-stone-900">
              {currentStep === 1 ? "Jadwal kedatangan" : "Jumlah tamu & meja"}
            </h2>
          </div>

          <ol aria-label="Langkah reservasi" className="mb-7 grid grid-cols-2 gap-3">
            <li
              aria-current={currentStep === 1 ? "step" : undefined}
              className={`rounded-xl border p-3 text-sm ${
                currentStep === 1
                  ? "border-orange-400 bg-orange-50 text-orange-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide">Langkah 1</span>
              <span className="mt-1 block font-semibold">Jadwal</span>
            </li>
            <li
              aria-current={currentStep === 2 ? "step" : undefined}
              className={`rounded-xl border p-3 text-sm ${
                currentStep === 2
                  ? "border-orange-400 bg-orange-50 text-orange-950"
                  : "border-stone-200 bg-stone-50 text-stone-500"
              }`}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide">Langkah 2</span>
              <span className="mt-1 block font-semibold">Tamu & meja</span>
            </li>
          </ol>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 ? (
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
            ) : (
              <>
                <div>
                  <label htmlFor="reservation-outlet" className="mb-2 block text-sm font-semibold text-stone-800">
                    Outlet
                  </label>
                  <div className="relative">
                    <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-700" />
                    <select
                      id="reservation-outlet"
                      value={outletId}
                      onChange={(event) => {
                        setOutletId(event.target.value);
                        clearFeedback();
                      }}
                      className="w-full appearance-none rounded-xl border border-orange-200 bg-white py-3 pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      {mockReservationOutlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    {selectedOutlet?.address}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="reservation-guests" className="mb-2 block text-sm font-semibold text-stone-800">
                      Jumlah tamu
                    </label>
                    <div className="relative">
                      <Users aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-700" />
                      <select
                        id="reservation-guests"
                        value={guestCount}
                        onChange={(event) => {
                          setGuestCount(Number(event.target.value));
                          clearFeedback();
                        }}
                        className="w-full appearance-none rounded-xl border border-orange-200 bg-white py-3 pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        {guestOptions.map((guest) => (
                          <option key={guest} value={guest}>
                            {guest} orang
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <fieldset>
                    <legend className="mb-2 block text-sm font-semibold text-stone-800">
                      Tipe meja
                    </legend>
                    <div className="grid gap-2">
                      {availableTableTypes.map((tableType) => {
                        const isSelected = selectedTableType?.id === tableType.id;

                        return (
                          <label
                            key={tableType.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition focus-within:ring-4 focus-within:ring-orange-100 ${
                              isSelected
                                ? "border-orange-500 bg-orange-50"
                                : "border-orange-100 bg-white hover:border-orange-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="reservation-table-type"
                              value={tableType.id}
                              checked={isSelected}
                              onChange={() => {
                                setTableTypeId(tableType.id);
                                clearFeedback();
                              }}
                              className="mt-1 h-4 w-4 accent-orange-700"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 font-semibold text-stone-900">
                                <Armchair aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-700" />
                                {tableType.label}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-stone-600">
                                {tableType.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              </>
            )}

            {formError ? (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-900">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              {currentStep === 1 ? "Lanjut pilih jumlah tamu & meja" : "Tampilkan preview reservasi"}
            </button>
            {currentStep === 2 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  clearFeedback();
                }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-900 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Kembali ke jadwal
              </button>
            ) : null}
          </form>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section
            aria-labelledby="reservation-preview-title"
            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-orange-700">PREVIEW LOKAL</p>
            <h2 id="reservation-preview-title" className="mt-1 text-xl font-bold text-stone-900">
              {preview ? "Rincian kunjungan" : "Ringkasan reservasi"}
            </h2>

            {preview ? (
              <div role="status" className="mt-5 space-y-4">
                <p className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  Preview siap ditinjau. Belum ada meja yang dipesan atau data yang disimpan.
                </p>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Outlet</dt>
                    <dd className="mt-1 font-semibold text-stone-900">{preview.outletName}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Tamu</dt>
                      <dd className="mt-1 font-semibold text-stone-900">{preview.guestCount} orang</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">Meja</dt>
                      <dd className="mt-1 font-semibold text-stone-900">{preview.tableType}</dd>
                    </div>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                >
                  Atur ulang
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm leading-6 text-stone-600">
                Isi jadwal dan jumlah tamu, lalu tampilkan preview untuk memeriksa pilihanmu.
              </div>
            )}
          </section>

          <section
            aria-labelledby="reservation-member-note"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
          >
            <div className="flex items-start gap-3">
              <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
              <div>
                <h2 id="reservation-member-note" className="font-bold text-amber-950">
                  Fitur khusus member
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Login member belum terhubung pada preview ini. Akun tidak diverifikasi,
                  slot tidak menjamin ketersediaan, dan reservasi tidak dikirim atau disimpan.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
