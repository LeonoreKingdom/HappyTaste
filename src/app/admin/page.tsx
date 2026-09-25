import type { Metadata } from "next";
import {
  CalendarDays,
  CircleDollarSign,
  Info,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

import {
  getAdminDailyDashboard,
  type AdminDashboardOrderStatus,
} from "@/db/queries/admin-dashboard";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Dashboard Pengelola - HappyTaste Resto",
  description: "Ringkasan pesanan dan operasional harian HappyTaste Resto.",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("id-ID");
const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const statusLabels: Record<AdminDashboardOrderStatus, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  preparing: "Disiapkan",
  ready: "Siap",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const statusClasses: Record<AdminDashboardOrderStatus, string> = {
  pending: "bg-amber-50 text-amber-900 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-900 ring-sky-200",
  preparing: "bg-blue-50 text-blue-900 ring-blue-200",
  ready: "bg-violet-50 text-violet-900 ring-violet-200",
  completed: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-700 ring-stone-200",
};

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const dashboard = await getAdminDailyDashboard();
  const metrics = [
    {
      label: "Pendapatan terealisasi",
      value: currencyFormatter.format(dashboard.orders.realizedRevenue),
      detail: `${numberFormatter.format(dashboard.orders.completed)} pesanan selesai`,
      icon: CircleDollarSign,
      tone: "orange",
    },
    {
      label: "Pesanan dibuat",
      value: numberFormatter.format(dashboard.orders.totalCreated),
      detail: `${numberFormatter.format(dashboard.orders.active)} masih aktif`,
      icon: ShoppingBag,
      tone: "blue",
    },
    {
      label: "Reservasi hari ini",
      value: numberFormatter.format(dashboard.reservations.active),
      detail: `${numberFormatter.format(dashboard.reservations.pending)} menunggu konfirmasi`,
      icon: CalendarDays,
      tone: "violet",
    },
    {
      label: "Member terdaftar",
      value: numberFormatter.format(dashboard.memberCount),
      detail: "Profil member tersimpan",
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
  const maxBestSellerCount = Math.max(
    1,
    ...dashboard.bestSellers.map((item) => item.unitsSold),
  );

  return (
    <main className="space-y-5">
      <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">
            Panel pengelola · Operasional
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
            Ringkasan hari ini
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">{dashboard.displayDate}</p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600">
          <CalendarDays aria-hidden="true" className="h-4 w-4 text-stone-500" />
          Zona waktu Asia/Jakarta
        </p>
      </header>

      <aside
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sm leading-6 text-sky-950"
      >
        <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sky-800" />
        <p>
          Ringkasan ini memakai data yang tersimpan. Pendapatan hanya menghitung pesanan berstatus
          selesai; pesanan tertunda dan dibatalkan tidak ikut dijumlahkan.
        </p>
      </aside>

      <section aria-label="Metrik operasional hari ini" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
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
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-stone-500">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Aktivitas operasional</p>
              <h2 id="recent-orders-heading" className="mt-1 text-lg font-bold text-stone-950">
                Pesanan terbaru hari ini
              </h2>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
              {numberFormatter.format(dashboard.orders.totalCreated)} pesanan
            </span>
          </div>

          {dashboard.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <caption className="sr-only">Enam pesanan terbaru yang dibuat hari ini</caption>
                <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 sm:px-6">ID pesanan</th>
                    <th scope="col" className="px-4 py-3">Jenis</th>
                    <th scope="col" className="px-4 py-3">Waktu</th>
                    <th scope="col" className="px-4 py-3">Total</th>
                    <th scope="col" className="px-5 py-3 sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {dashboard.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <th scope="row" className="whitespace-nowrap px-5 py-4 font-semibold text-stone-900 sm:px-6">
                        {order.id.slice(0, 8).toLocaleUpperCase("id-ID")}
                      </th>
                      <td className="whitespace-nowrap px-4 py-4 text-stone-600">
                        {order.orderType === "advance" ? "Pesan dulu" : "Dine-in"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-stone-500">
                        <time dateTime={order.createdAt.toISOString()}>
                          {timeFormatter.format(order.createdAt)}
                        </time>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-stone-800">
                        {currencyFormatter.format(order.total)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div role="status" className="px-5 py-10 text-center sm:px-6">
              <ShoppingBag aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
              <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada pesanan hari ini</h3>
              <p className="mt-1 text-sm text-stone-500">Pesanan baru akan tercatat di sini setelah masuk.</p>
            </div>
          )}
        </section>

        <section aria-labelledby="best-sellers-heading" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-800">Dari pesanan selesai</p>
            <h2 id="best-sellers-heading" className="mt-1 text-lg font-bold text-stone-950">
              Menu terlaris hari ini
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">Diurutkan berdasarkan jumlah unit terjual.</p>
          </div>

          {dashboard.bestSellers.length > 0 ? (
            <ol className="mt-5 space-y-5">
              {dashboard.bestSellers.map((item, index) => (
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
                    <span className="shrink-0 text-xs font-bold text-stone-700">
                      {numberFormatter.format(item.unitsSold)} unit
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${item.name}: ${numberFormatter.format(item.unitsSold)} unit terjual hari ini`}
                    aria-valuemin={0}
                    aria-valuemax={maxBestSellerCount}
                    aria-valuenow={item.unitsSold}
                    className="ml-10 mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"
                  >
                    <div
                      className="h-full rounded-full bg-orange-600"
                      style={{ width: `${Math.round((item.unitsSold / maxBestSellerCount) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div role="status" className="mt-5 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-5 text-center">
              <h3 className="text-sm font-semibold text-stone-900">Belum ada penjualan selesai</h3>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Menu akan dirangkum setelah pesanan hari ini selesai.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
