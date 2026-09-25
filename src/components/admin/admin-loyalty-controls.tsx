"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AdminLoyaltySettingsFormProps = {
  currentIdrPerPoint: number;
};

type PointsAdjustmentFormProps = {
  memberId: string;
  memberName: string;
};

export function AdminLoyaltySettingsForm({
  currentIdrPerPoint,
}: AdminLoyaltySettingsFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState({ baseRate: currentIdrPerPoint, value: String(currentIdrPerPoint) });
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const idrPerPoint = draft.baseRate === currentIdrPerPoint
    ? draft.value
    : String(currentIdrPerPoint);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !/^\d+$/.test(idrPerPoint)) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/loyalty-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idrPerPoint: Number(idrPerPoint) }),
        });
        const result: {
          success?: boolean;
          error?: string;
          data?: { idrPerPoint?: number };
        } = await response.json();
        if (!response.ok || !result.success || !result.data?.idrPerPoint) {
          setErrorMessage(result.error ?? "Aturan poin tidak dapat disimpan.");
          return;
        }

        const savedRate = result.data.idrPerPoint;
        setDraft({ baseRate: savedRate, value: String(savedRate) });
        setSuccessMessage("Aturan baru tersimpan dan berlaku untuk penyelesaian pesanan berikutnya. Riwayat poin lama tidak berubah.");
        router.refresh();
      } catch {
        setErrorMessage("Koneksi bermasalah. Coba simpan kembali.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <label htmlFor="admin-idr-per-point" className="mb-1.5 block text-sm font-semibold text-stone-800">
          Nilai pesanan untuk 1 poin (rupiah)
        </label>
        <input
          id="admin-idr-per-point"
          type="number"
          min="1"
          step="1"
          required
          value={idrPerPoint}
          onChange={(event) => {
            setDraft({ baseRate: currentIdrPerPoint, value: event.target.value });
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          disabled={isPending}
          className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:opacity-60 sm:max-w-64"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !/^\d+$/.test(idrPerPoint) || Number(idrPerPoint) === currentIdrPerPoint}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-4 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Menyimpan…" : "Simpan aturan"}
      </button>
      {errorMessage && <p role="alert" className="text-sm text-red-700 sm:basis-full">{errorMessage}</p>}
      {successMessage && <p role="status" className="text-sm text-emerald-800 sm:basis-full">{successMessage}</p>}
      <p className="sr-only" aria-live="polite">{isPending ? "Menyimpan aturan poin." : ""}</p>
    </form>
  );
}

export function MemberPointsAdjustmentForm({ memberId, memberName }: PointsAdjustmentFormProps) {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [pointsDelta, setPointsDelta] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function resetRequestKey() {
    requestId.current = null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !pointsDelta.trim() || !reason.trim()) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    requestId.current ??= crypto.randomUUID();
    const currentRequestId = requestId.current;
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/points`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pointsDelta: Number(pointsDelta),
            reason,
            requestId: currentRequestId,
          }),
        });
        const result: {
          success?: boolean;
          error?: string;
          data?: { status?: "applied" | "already_applied"; pointsDelta?: number; balanceAfter?: number };
        } = await response.json();
        if (!response.ok || !result.success || !result.data) {
          setErrorMessage(result.error ?? "Penyesuaian poin tidak dapat disimpan.");
          return;
        }

        requestId.current = null;
        setPointsDelta("");
        setReason("");
        const outcome = result.data.status === "already_applied" ? "Penyesuaian ini sudah tercatat" : "Penyesuaian tersimpan";
        setSuccessMessage(`${outcome}: ${result.data.pointsDelta} poin. Saldo setelah pencatatan ${result.data.balanceAfter} poin.`);
        router.refresh();
      } catch {
        setErrorMessage("Koneksi bermasalah. Kirim ulang untuk memeriksa hasil penyesuaian yang sama.");
      }
    });
  }

  return (
    <details className="mt-2 text-left">
      <summary className="w-fit cursor-pointer rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
        Sesuaikan poin
      </summary>
      <form onSubmit={handleSubmit} className="mt-3 w-72 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:w-80">
        <p className="text-xs leading-5 text-stone-600">Penyesuaian manual untuk {memberName}. Gunakan angka positif untuk menambah, negatif untuk mengurangi; alasan akan masuk ke ledger.</p>
        <div>
          <label htmlFor={`points-delta-${memberId}`} className="mb-1 block text-xs font-semibold text-stone-800">Perubahan poin</label>
          <input
            id={`points-delta-${memberId}`}
            type="number"
            step="1"
            required
            value={pointsDelta}
            onChange={(event) => { setPointsDelta(event.target.value); resetRequestKey(); setErrorMessage(null); setSuccessMessage(null); }}
            disabled={isPending}
            placeholder="Contoh: 50 atau -20"
            className="min-h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor={`points-reason-${memberId}`} className="mb-1 block text-xs font-semibold text-stone-800">Alasan (5–300 karakter)</label>
          <textarea
            id={`points-reason-${memberId}`}
            rows={2}
            minLength={5}
            maxLength={300}
            required
            value={reason}
            onChange={(event) => { setReason(event.target.value); resetRequestKey(); setErrorMessage(null); setSuccessMessage(null); }}
            disabled={isPending}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !pointsDelta.trim() || reason.trim().length < 5}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-700 px-3 text-xs font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Menyimpan…" : "Simpan penyesuaian"}
        </button>
        {errorMessage && <p role="alert" className="text-xs leading-5 text-red-700">{errorMessage}</p>}
        {successMessage && <p role="status" className="text-xs leading-5 text-emerald-800">{successMessage}</p>}
        <p className="sr-only" aria-live="polite">{isPending ? "Menyimpan penyesuaian poin." : ""}</p>
      </form>
    </details>
  );
}
