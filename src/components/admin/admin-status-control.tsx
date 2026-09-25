"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export type AdminStatusOption = {
  value: string;
  label: string;
};

type AdminStatusControlProps = {
  resource: "orders" | "reservations";
  recordId: string;
  currentStatus: string;
  options: AdminStatusOption[];
};

type StatusResponse = {
  success?: boolean;
  error?: string;
  data?: {
    status?: string;
    loyalty?: {
      status: "awarded" | "already_awarded" | "skipped";
      pointsAwarded?: number;
    } | null;
  };
};

export function AdminStatusControl({
  resource,
  recordId,
  currentStatus,
  options,
}: AdminStatusControlProps) {
  const router = useRouter();
  const [selection, setSelection] = useState({ baseStatus: currentStatus, value: currentStatus });
  const selectedStatus = selection.baseStatus === currentStatus
    ? selection.value
    : currentStatus;
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || selectedStatus === currentStatus) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/${resource}/${encodeURIComponent(recordId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selectedStatus }),
        });
        const result = await response.json() as StatusResponse;
        if (!response.ok || !result.success) {
          setErrorMessage(result.error ?? "Status tidak dapat diperbarui. Muat ulang dan coba lagi.");
          return;
        }

        const savedStatus = result.data?.status ?? selectedStatus;
        setSelection({ baseStatus: savedStatus, value: savedStatus });
        if (resource === "orders" && savedStatus === "completed" && result.data?.loyalty) {
          const loyalty = result.data.loyalty;
          if (loyalty.status === "awarded") {
            setSuccessMessage(`Status disimpan. ${loyalty.pointsAwarded ?? 0} poin tercatat untuk pesanan ini.`);
          } else if (loyalty.status === "already_awarded") {
            setSuccessMessage("Status disimpan. Poin untuk pesanan ini sudah pernah tercatat.");
          } else {
            setSuccessMessage("Status disimpan. Pesanan ini tidak memenuhi syarat perolehan poin.");
          }
        } else {
          setSuccessMessage("Status berhasil diperbarui.");
        }
        router.refresh();
      } catch {
        setErrorMessage("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
      }
    });
  }

  if (options.length === 0) {
    return (
      <div className="mt-2">
        <p className="text-xs text-stone-500">Status final</p>
        {successMessage && <p role="status" className="mt-1 max-w-56 text-xs leading-5 text-emerald-800">{successMessage}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col items-start gap-2">
      <label className="sr-only" htmlFor={`${resource}-status-${recordId}`}>
        Ubah status {resource === "orders" ? "pesanan" : "reservasi"}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id={`${resource}-status-${recordId}`}
          value={selectedStatus}
          onChange={(event) => setSelection({ baseStatus: currentStatus, value: event.target.value })}
          disabled={isPending}
          className="min-h-9 max-w-48 rounded-lg border border-stone-300 bg-white px-2.5 text-xs font-medium text-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:opacity-60"
        >
          <option value={currentStatus}>Pilih status…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || selectedStatus === currentStatus}
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-orange-700 px-3 text-xs font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
      {errorMessage && <p role="alert" className="max-w-56 text-xs leading-5 text-red-700">{errorMessage}</p>}
      {successMessage && <p role="status" className="max-w-56 text-xs leading-5 text-emerald-800">{successMessage}</p>}
      <p className="sr-only" aria-live="polite">{isPending ? "Menyimpan status." : ""}</p>
    </form>
  );
}
