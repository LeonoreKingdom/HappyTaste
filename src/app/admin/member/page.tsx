import type { Metadata } from "next";
import { CircleUserRound, Coins, History, Settings2 } from "lucide-react";

import {
  AdminLoyaltySettingsForm,
  MemberPointsAdjustmentForm,
} from "@/components/admin/admin-loyalty-controls";
import { BASE_IDR_PER_POINT } from "@/lib/loyalty-earning-policy";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Kelola Member & Poin - HappyTaste Resto",
  description: "Daftar member dan riwayat transaksi poin loyalty tersimpan.",
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const transactionTypeLabels = {
  earn: "Poin diperoleh",
  redeem: "Penukaran hadiah",
  adjustment: "Penyesuaian",
  expire: "Poin kedaluwarsa",
} as const;

const transactionTypeClasses: Record<string, string> = {
  earn: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  redeem: "bg-violet-50 text-violet-800 ring-violet-200",
  adjustment: "bg-sky-50 text-sky-800 ring-sky-200",
  expire: "bg-amber-50 text-amber-900 ring-amber-200",
};

const pointsFormatter = new Intl.NumberFormat("id-ID", {
  signDisplay: "always",
  maximumFractionDigits: 0,
});

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatMemberName(name: string) {
  return name.trim() || "Member tanpa nama";
}

export default async function AdminMembersPage() {
  await requireAdminPage();

  let members: Awaited<ReturnType<typeof import("@/db/queries/admin-members").getAdminMemberOverview>>["members"];
  let transactions: Awaited<ReturnType<typeof import("@/db/queries/admin-members").getAdminMemberOverview>>["transactions"];
  let settings: {
    id: string;
    idrPerPoint: number;
    updatedAt: Date;
    updatedByName: string | null;
  } | null = null;
  let ruleChanges: Awaited<ReturnType<typeof import("@/db/queries/admin-members").getAdminMemberOverview>>["ruleChanges"] = [];
  let loadFailed = false;

  try {
    const { getAdminMemberOverview } = await import("@/db/queries/admin-members");
    ({ members, transactions, settings, ruleChanges } = await getAdminMemberOverview());
  } catch (error) {
    console.error("Failed to load admin member overview", error);
    members = [];
    transactions = [];
    settings = null;
    ruleChanges = [];
    loadFailed = true;
  }

  return (
    <main className="space-y-6">
      <header className="px-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Member</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Member &amp; poin</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Informasi identitas dan saldo berasal dari member profile; riwayat bersumber dari ledger loyalty.</p>
      </header>

      {loadFailed || !settings ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Data member, ledger, atau pengaturan poin tidak dapat dimuat. Pastikan migrasi database terbaru diterapkan, lalu muat ulang halaman.
        </div>
      ) : (
        <>
          <section aria-labelledby="admin-loyalty-rules-heading" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Settings2 aria-hidden="true" className="h-4 w-4 text-orange-700" />
              <h2 id="admin-loyalty-rules-heading" className="text-lg font-bold text-stone-950">Aturan perolehan poin</h2>
            </div>
            <p className="mt-2 text-sm text-stone-600">
              Saat ini <span className="font-semibold text-stone-900">1 poin untuk setiap {idrFormatter.format(settings.idrPerPoint)}</span> nilai pesanan member yang selesai. Perubahan hanya berlaku untuk award berikutnya; saldo dan ledger lama tidak dihitung ulang.
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Default kebijakan bisnis: 1 poin per {idrFormatter.format(BASE_IDR_PER_POINT)}. Pengali promo 2× belum termasuk dalam aturan ini.
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Terakhir diperbarui oleh {settings.updatedByName ?? "sistem"} pada{" "}
              <time dateTime={settings.updatedAt.toISOString()}>{dateTimeFormatter.format(settings.updatedAt)}</time>.
            </p>
            <AdminLoyaltySettingsForm currentIdrPerPoint={settings.idrPerPoint} />

            <div className="mt-5 border-t border-stone-100 pt-4">
              <h3 className="text-sm font-bold text-stone-900">Riwayat perubahan aturan</h3>
              {ruleChanges.length > 0 ? (
                <ul className="mt-2 divide-y divide-stone-100 text-sm">
                  {ruleChanges.map((change) => (
                    <li key={change.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-stone-700">
                        {idrFormatter.format(change.previousIdrPerPoint)} → {idrFormatter.format(change.newIdrPerPoint)} per poin
                        <span className="ml-1 text-stone-500">oleh {change.changedByName ?? "admin yang sudah tidak aktif"}</span>
                      </p>
                      <time className="text-xs text-stone-500" dateTime={change.createdAt.toISOString()}>{dateTimeFormatter.format(change.createdAt)}</time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-stone-500">Belum ada perubahan aturan; nilai awal menggunakan kebijakan bisnis yang disetujui.</p>
              )}
            </div>
          </section>

          <section aria-labelledby="admin-members-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <CircleUserRound aria-hidden="true" className="h-4 w-4 text-orange-700" />
                <h2 id="admin-members-heading" className="text-lg font-bold text-stone-950">Daftar member</h2>
              </div>
              <p className="mt-1 text-sm text-stone-500">Menampilkan maksimal 100 member terbaru beserta saldo loyalty tersimpan.</p>
            </div>
            {members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[64rem] text-left text-sm">
                  <caption className="sr-only">Seratus member terbaru dan saldo poin loyalty</caption>
                  <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    <tr>
                      <th scope="col" className="px-5 py-3 sm:px-6">Member</th>
                      <th scope="col" className="px-4 py-3">Email</th>
                      <th scope="col" className="px-4 py-3">Telepon</th>
                      <th scope="col" className="px-4 py-3">Terdaftar</th>
                      <th scope="col" className="px-5 py-3 text-right sm:px-6">Saldo poin</th>
                      <th scope="col" className="px-5 py-3 text-right sm:px-6">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <th scope="row" className="px-5 py-4 font-semibold text-stone-900 sm:px-6">{formatMemberName(member.name)}</th>
                        <td className="px-4 py-4 text-stone-700">{member.email}</td>
                        <td className="px-4 py-4 text-stone-600">{member.phone || "Belum diisi"}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-stone-600">
                          <time dateTime={member.joinedAt.toISOString()}>{dateTimeFormatter.format(member.joinedAt)}</time>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-stone-900 sm:px-6">
                          {pointsFormatter.format(member.pointsBalance)} poin
                        </td>
                        <td className="px-5 py-4 text-right align-top sm:px-6">
                          <MemberPointsAdjustmentForm memberId={member.id} memberName={formatMemberName(member.name)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div role="status" className="px-5 py-10 text-center sm:px-6">
                <CircleUserRound aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
                <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada member tersimpan</h3>
              </div>
            )}
          </section>

          <section aria-labelledby="admin-loyalty-history-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <History aria-hidden="true" className="h-4 w-4 text-orange-700" />
                <h2 id="admin-loyalty-history-heading" className="text-lg font-bold text-stone-950">Riwayat poin loyalty</h2>
              </div>
              <p className="mt-1 text-sm text-stone-500">Entri terbaru dari ledger; saldo setelah transaksi ditampilkan untuk rekonsiliasi.</p>
            </div>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[58rem] text-left text-sm">
                  <caption className="sr-only">Seratus transaksi poin loyalty terbaru</caption>
                  <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    <tr>
                      <th scope="col" className="px-5 py-3 sm:px-6">Member</th>
                      <th scope="col" className="px-4 py-3">Transaksi</th>
                      <th scope="col" className="px-4 py-3">Keterangan</th>
                      <th scope="col" className="px-4 py-3">Waktu</th>
                      <th scope="col" className="px-4 py-3 text-right">Perubahan</th>
                      <th scope="col" className="px-5 py-3 text-right sm:px-6">Saldo setelah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <th scope="row" className="px-5 py-4 align-top sm:px-6">
                          <p className="font-semibold text-stone-900">{formatMemberName(transaction.memberName)}</p>
                          <p className="mt-1 text-xs font-normal text-stone-500">{transaction.memberEmail}</p>
                        </th>
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${transactionTypeClasses[transaction.type] ?? "bg-stone-100 text-stone-700 ring-stone-200"}`}>
                            {transactionTypeLabels[transaction.type] ?? "Transaksi poin"}
                          </span>
                        </td>
                        <td className="max-w-sm whitespace-normal px-4 py-4 align-top text-stone-700">
                          <p>{transaction.description}</p>
                          {transaction.type === "adjustment" && transaction.adjustmentByName && (
                            <p className="mt-1 text-xs text-stone-500">Dicatat oleh {transaction.adjustmentByName}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">
                          <time dateTime={transaction.createdAt.toISOString()}>{dateTimeFormatter.format(transaction.createdAt)}</time>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right align-top font-semibold text-stone-900">
                          {pointsFormatter.format(transaction.pointsDelta)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right align-top text-stone-700 sm:px-6">
                          {pointsFormatter.format(transaction.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div role="status" className="px-5 py-10 text-center sm:px-6">
                <Coins aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
                <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada transaksi poin</h3>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
