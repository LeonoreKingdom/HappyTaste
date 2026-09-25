"use client";

import { useEffect, useRef, useState } from "react";

type LoyaltyRewardConfirmationProps = {
  rewardId: string;
  rewardName: string;
  requiredPoints: number;
  availablePoints: number;
};

const pointsFormatter = new Intl.NumberFormat("id-ID");

export function LoyaltyRewardConfirmation({
  rewardId,
  rewardName,
  requiredPoints,
  availablePoints,
}: LoyaltyRewardConfirmationProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasSimulated, setWasSimulated] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canAfford = availablePoints >= requiredPoints;
  const pointsShortfall = Math.max(0, requiredPoints - availablePoints);
  const dialogTitleId = `loyalty-redemption-title-${rewardId}`;
  const dialogDescriptionId = `loyalty-redemption-description-${rewardId}`;

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

  function confirmSimulation() {
    setWasSimulated(true);
    closeDialog();
  }

  if (!canAfford) {
    return (
      <p className="mt-3 w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
        Kurang {pointsFormatter.format(pointsShortfall)} poin demo
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        Saldo demo cukup
      </p>

      {wasSimulated ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950"
        >
          Simulasi selesai. Saldo contoh tetap {pointsFormatter.format(availablePoints)} poin;
          tidak ada hadiah yang ditukar atau transaksi yang disimpan.
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-violet-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
      >
        {wasSimulated ? "Ulangi simulasi" : "Simulasikan penukaran"}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        onCancel={closeDialog}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-black/60"
      >
        <div className="p-6 sm:p-7">
          <p className="text-sm font-semibold tracking-wide text-violet-700">KONFIRMASI DEMO</p>
          <h2 id={dialogTitleId} className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            Simulasikan penukaran hadiah?
          </h2>
          <p id={dialogDescriptionId} className="mt-3 text-sm leading-6 text-stone-600">
            {rewardName} membutuhkan {pointsFormatter.format(requiredPoints)} poin contoh. Ini
            hanya pratinjau: saldo {pointsFormatter.format(availablePoints)} poin tidak berubah,
            hadiah tidak ditukar, dan tidak ada transaksi yang disimpan.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeDialog}
              className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmSimulation}
              className="inline-flex items-center justify-center rounded-xl bg-violet-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              Konfirmasi simulasi
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
