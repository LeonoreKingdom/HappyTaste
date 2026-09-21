import { CalendarDays, Clock3 } from "lucide-react";

type ArrivalScheduleStepProps = {
  date: string;
  time: string;
  timeSlots: readonly string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

export function ArrivalScheduleStep({
  date,
  time,
  timeSlots,
  onDateChange,
  onTimeChange,
}: ArrivalScheduleStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-stone-600">
        Pilih tanggal dan salah satu jam kedatangan yang tersedia untuk outlet demo.
      </p>

      <div>
        <label htmlFor="reservation-date" className="mb-2 block text-sm font-semibold text-stone-800">
          Tanggal kunjungan
        </label>
        <div className="relative">
          <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-700" />
          <input
            id="reservation-date"
            type="date"
            value={date}
            required
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-white py-3 pl-10 pr-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-stone-800">
          Waktu kedatangan
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {timeSlots.map((slot) => {
            const selected = time === slot;

            return (
              <label
                key={slot}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition focus-within:ring-4 focus-within:ring-orange-100 ${
                  selected
                    ? "border-orange-500 bg-orange-50 text-orange-950"
                    : "border-orange-100 bg-white text-stone-700 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="reservation-time"
                  value={slot}
                  checked={selected}
                  onChange={() => onTimeChange(slot)}
                  className="sr-only"
                />
                <Clock3 aria-hidden="true" className="h-4 w-4 text-orange-700" />
                {slot}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
