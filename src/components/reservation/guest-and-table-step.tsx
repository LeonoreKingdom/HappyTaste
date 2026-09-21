import { Armchair, Minus, Plus, Users } from "lucide-react";

type GuestAndTableStepProps = {
  guestCount: number;
  tableTypes: readonly {
    id: string;
    label: string;
    description: string;
    minGuests: number;
    maxGuests: number;
  }[];
  selectedTableTypeId?: string;
  onGuestCountChange: (guestCount: number) => void;
  onTableTypeChange: (tableTypeId: string) => void;
};

const MIN_GUESTS = 1;
const MAX_GUESTS = 8;

export function GuestAndTableStep({
  guestCount,
  tableTypes,
  selectedTableTypeId,
  onGuestCountChange,
  onTableTypeChange,
}: GuestAndTableStepProps) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="reservation-guests-title">
        <div className="mb-3">
          <h3 id="reservation-guests-title" className="text-sm font-semibold text-stone-800">
            Jumlah tamu
          </h3>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Pilih jumlah orang yang akan datang (1–8 orang).
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <Users aria-hidden="true" className="h-5 w-5" />
            </span>
            <span aria-live="polite" className="font-semibold text-stone-900">
              {guestCount} orang
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Kurangi jumlah tamu"
              disabled={guestCount <= MIN_GUESTS}
              onClick={() => onGuestCountChange(Math.max(MIN_GUESTS, guestCount - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-200 text-orange-800 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Tambah jumlah tamu"
              disabled={guestCount >= MAX_GUESTS}
              onClick={() => onGuestCountChange(Math.min(MAX_GUESTS, guestCount + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-200 text-orange-800 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <fieldset>
        <legend className="text-sm font-semibold text-stone-800">Pilih tipe meja</legend>
        <p className="mb-3 mt-1 text-xs leading-5 text-stone-500">
          Pilihan meja disesuaikan dengan jumlah tamu.
        </p>

        {tableTypes.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {tableTypes.map((tableType) => {
              const selected = selectedTableTypeId === tableType.id;

              return (
                <label
                  key={tableType.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition focus-within:ring-4 focus-within:ring-orange-100 ${
                    selected
                      ? "border-orange-500 bg-orange-50"
                      : "border-orange-100 bg-white hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="reservation-table-type"
                    value={tableType.id}
                    checked={selected}
                    required
                    onChange={() => onTableTypeChange(tableType.id)}
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
                    <span className="mt-2 block text-xs font-medium text-orange-800">
                      Cocok untuk {tableType.minGuests}–{tableType.maxGuests} tamu
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Belum ada tipe meja yang sesuai. Kurangi jumlah tamu untuk melihat pilihan lain.
          </p>
        )}
      </fieldset>
    </div>
  );
}
