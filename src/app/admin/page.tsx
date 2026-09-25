import type { Metadata } from "next";
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Info,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

import {
  mockAdminBestSellers,
  mockAdminDashboardSummary,
  mockAdminRecentOrders,
  type MockAdminOrderStatus,
} from "@/data/mock-admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard Pengelola (Demo) - HappyTaste Resto",
  description: "Pratinjau dashboard operasional HappyTaste dengan data tiruan.",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("id-ID");

const metrics = [
  {
    label: "Pendapatan hari ini",
    value: currencyFormatter.format(mockAdminDashboardSummary.revenueToday),
    detail: mockAdminDashboardSummary.revenueChange,
    icon: CircleDollarSign,
    tone: "orange",
  },
  {
    label: "Pesanan hari ini",
    value: numberFormatter.format(mockAdminDashboardSummary.ordersToday),
    detail: `${numberFormatter.format(mockAdminDashboardSummary.pendingOrders)} menunggu diproses`,
    icon: ShoppingBag,
    tone: "blue",
  },
  {
    label: "Reservasi hari ini",
    value: numberFormatter.format(mockAdminDashboardSummary.reservationsToday),
    detail: `${numberFormatter.format(mockAdminDashboardSummary.pendingReservations)} perlu konfirmasi`,
    icon: CalendarDays,
    tone: "violet",
  },
  {
    label: "Member terdaftar",
    value: numberFormatter.format(mockAdminDashboardSummary.activeMembers),
    detail: `+${numberFormatter.format(mockAdminDashboardSummary.newMembersThisMonth)} bulan ini`,
    icon: UsersRound,
    tone: "emerald",
  },
] as const;

const metricToneClasses = {
  orange: "bg-orange-50 text-orange-800",
  blue: "bg-sky-50 text-sky-800",
  violet: "bg-violet-50 text-violet-800",
  emerald: "bg-emerald-50 text-emerald-800",
} as const;

const statusClasses: Record<MockAdminOrderStatus, string> = {
  Menunggu: "bg-amber-50 text-amber-900 ring-amber-200",
  Diproses: "bg-sky-50 text-sky-900 ring-sky-200",
  Siap: "bg-violet-50 text-violet-900 ring-violet-200",
  Selesai: "bg-emerald-50 text-emerald-900 ring-emerald-200",
};

const maxBestSellerCount = Math.max(...mockAdminBestSellers.map((item) => item.sold));

export default function AdminDashboardPage() {
  return (
    <main className="space-y-5">
      <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">
            Ringkasan operasional · Demo
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
            Dashboard pengelola
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Gambaran singkat aktivitas restoran untuk membantu pengelola memulai hari.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600">
          <Clock3 aria-hidden="true" className="h-4 w-4 text-stone-500" />
          Contoh hari operasional
        </p>
      </header>

      <aside
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-6 text-amber-950"
      >
        <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
        <p>
          Angka, pesanan, pelanggan, dan menu pada halaman ini adalah data contoh untuk pratinjau.
          Data ini tidak berasal dari transaksi nyata, tidak memberi hak akses, dan tidak disimpan.
        </p>
      </aside>

      <section aria-label="Metrik operasional contoh" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-stone-600">{metric.label}</p>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metricToneClasses[metric.tone]}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 break-words text-2xl font-bold tracking-tight text-stone-950">{metric.value}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                {metric.detail}
              </p>
            </article>
          );
        })}
      </section>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
        <section aria-labelledby="recent-orders-heading" className="min-w-0 rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Aktivitas terbaru · contoh</p>
              <h2 id="recent-orders-heading" className="mt-1 text-lg font-bold text-stone-950">
                Pesanan terbaru
              </h2>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
              {numberFormatter.format(mockAdminRecentOrders.length)} contoh
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Contoh pesanan terbaru HappyTaste, bukan transaksi nyata</caption>
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">ID pesanan</th>
                  <th scope="col" className="px-4 py-3">Pelanggan contoh</th>
                  <th scope="col" className="px-4 py-3">Waktu</th>
                  <th scope="col" className="px-4 py-3">Total</th>
                  <th scope="col" className="px-5 py-3 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {mockAdminRecentOrders.map((order) => (
                  <tr key={order.id}>
                    <th scope="row" className="whitespace-nowrap px-5 py-4 font-semibold text-stone-900 sm:px-6">
                      {order.id}
                    </th>
                    <td className="whitespace-nowrap px-4 py-4 text-stone-600">{order.customer}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-stone-500">{order.time}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-stone-800">
                      {currencyFormatter.format(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="best-sellers-heading" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">Contoh penjualan</p>
            <h2 id="best-sellers-heading" className="mt-1 text-lg font-bold text-stone-950">
              Menu terlaris
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">Jumlah unit contoh pada periode demo.</p>
          </div>

          <ol className="mt-5 space-y-5">
            {mockAdminBestSellers.map((item, index) => (
              <li key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-800">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
                      <p className="mt-0.5 text-xs text-stone-500">{item.category}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-stone-700">{numberFormatter.format(item.sold)} unit</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${item.name}: ${numberFormatter.format(item.sold)} unit contoh terjual`}
                  aria-valuemin={0}
                  aria-valuemax={maxBestSellerCount}
                  aria-valuenow={item.sold}
                  className="ml-10 mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"
                >
                  <div
                    className="h-full rounded-full bg-orange-600"
                    style={{ width: `${Math.round((item.sold / maxBestSellerCount) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
