import type { Metadata } from "next";
import { CalendarDays, ShoppingBag } from "lucide-react";

import { AdminStatusControl } from "@/components/admin/admin-status-control";
import { listAdminOrders } from "@/db/queries/admin-orders";
import { listManagementReservations } from "@/db/queries/reservations";
import {
  getAdminOrderStatusTransitions,
  getAdminReservationStatusTransitions,
} from "@/db/services/admin-status";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Pesanan & Reservasi - HappyTaste Resto",
  description: "Daftar pesanan dan reservasi tersimpan pada panel pengelola HappyTaste Resto.",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const orderDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const reservationDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

const orderStatusLabels = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  preparing: "Disiapkan",
  ready: "Siap",
  completed: "Selesai",
  cancelled: "Dibatalkan",
} as const;

const reservationStatusLabels = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
} as const;

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-900 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
  preparing: "bg-violet-50 text-violet-800 ring-violet-200",
  ready: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  completed: "bg-stone-100 text-stone-700 ring-stone-200",
  cancelled: "bg-red-50 text-red-800 ring-red-200",
};

const orderTypeLabels = {
  dine_in: "Makan di tempat",
  advance: "Pesan di muka",
} as const;

const paymentMethodLabels = {
  cash: "Tunai di kasir",
  card: "Kartu di kasir",
  qris: "QRIS (simulasi)",
} as const;

function formatReference(id: string) {
  return id.length > 12 ? `…${id.slice(-8)}` : id;
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status] ?? statusClasses.pending}`}>
      {label}
    </span>
  );
}

export default async function AdminOrdersAndReservationsPage() {
  await requireAdminPage();

  const [orderResult, reservationResult] = await Promise.allSettled([
    listAdminOrders(),
    listManagementReservations(),
  ]);
  const orders = orderResult.status === "fulfilled" ? orderResult.value : [];
  const reservations = reservationResult.status === "fulfilled" ? reservationResult.value : [];

  if (orderResult.status === "rejected") {
    console.error("Failed to load admin orders", orderResult.reason);
  }
  if (reservationResult.status === "rejected") {
    console.error("Failed to load admin reservations", reservationResult.reason);
  }

  return (
    <main className="space-y-6">
      <header className="px-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Operasional</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Pesanan &amp; reservasi</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Daftar ini menggunakan pesanan dan reservasi yang tersimpan. Pesanan menampilkan 100 data terbaru.</p>
      </header>

      <section aria-labelledby="admin-orders-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag aria-hidden="true" className="h-4 w-4 text-orange-700" />
            <h2 id="admin-orders-heading" className="text-lg font-bold text-stone-950">Daftar pesanan</h2>
          </div>
          <p className="mt-1 text-sm text-stone-500">Urut dari pesanan terbaru. Metode QRIS masih berstatus simulasi.</p>
        </div>
        {orderResult.status === "rejected" ? (
          <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Data pesanan tidak dapat dimuat saat ini. Coba muat ulang halaman.
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-sm">
              <caption className="sr-only">Seratus pesanan terbaru beserta status dan rincian ringkas</caption>
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">Pesanan</th>
                  <th scope="col" className="px-4 py-3">Pelanggan</th>
                  <th scope="col" className="px-4 py-3">Outlet / meja</th>
                  <th scope="col" className="px-4 py-3">Dibuat</th>
                  <th scope="col" className="px-4 py-3">Item / bayar</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right sm:px-6">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <th scope="row" className="px-5 py-4 align-top sm:px-6">
                      <p className="font-semibold text-stone-900">{formatReference(order.id)}</p>
                      <p className="mt-1 text-xs text-stone-500">{orderTypeLabels[order.orderType]}</p>
                      {order.scheduledAt && (
                        <p className="mt-1 text-xs text-stone-500">Jadwal: {orderDateFormatter.format(order.scheduledAt)}</p>
                      )}
                    </th>
                    <td className="px-4 py-4 align-top text-stone-700">
                      {order.userId ? order.memberName || "Member" : "Tamu"}
                    </td>
                    <td className="px-4 py-4 align-top text-stone-700">
                      <p>{order.outletName ?? "Outlet tidak tersedia"}</p>
                      {order.outletIsDemoLocation && <p className="mt-1 text-xs text-amber-800">Outlet demo</p>}
                      <p className="mt-1 text-xs text-stone-500">{order.tableNumber ? `Meja ${order.tableNumber}` : order.tableId ? "Detail meja tidak tersedia" : "—"}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">
                      <time dateTime={order.createdAt.toISOString()}>{orderDateFormatter.format(order.createdAt)}</time>
                    </td>
                    <td className="px-4 py-4 align-top text-stone-600">
                      <p>{order.itemCount} item</p>
                      <p className="mt-1 text-xs">{paymentMethodLabels[order.paymentMethod]}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <StatusBadge status={order.status} label={orderStatusLabels[order.status]} />
                      <AdminStatusControl
                        resource="orders"
                        recordId={order.id}
                        currentStatus={order.status}
                        options={getAdminOrderStatusTransitions(order.status).map((status) => ({
                          value: status,
                          label: orderStatusLabels[status],
                        }))}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right align-top font-semibold text-stone-900 sm:px-6">
                      {currencyFormatter.format(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="status" className="px-5 py-10 text-center sm:px-6">
            <ShoppingBag aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
            <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada pesanan tersimpan</h3>
          </div>
        )}
      </section>

      <section aria-labelledby="admin-reservations-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-orange-700" />
            <h2 id="admin-reservations-heading" className="text-lg font-bold text-stone-950">Daftar reservasi</h2>
          </div>
          <p className="mt-1 text-sm text-stone-500">Reservasi tersimpan untuk outlet demo tetap diberi label sebagai data demonstrasi.</p>
        </div>
        {reservationResult.status === "rejected" ? (
          <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Data reservasi tidak dapat dimuat saat ini. Coba muat ulang halaman.
          </div>
        ) : reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <caption className="sr-only">Daftar reservasi tersimpan beserta pelanggan, jadwal, dan status</caption>
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">Reservasi</th>
                  <th scope="col" className="px-4 py-3">Member</th>
                  <th scope="col" className="px-4 py-3">Outlet</th>
                  <th scope="col" className="px-4 py-3">Jadwal</th>
                  <th scope="col" className="px-4 py-3">Meja / tamu</th>
                  <th scope="col" className="px-5 py-3 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <th scope="row" className="px-5 py-4 align-top sm:px-6">
                      <p className="font-semibold text-stone-900">{formatReference(reservation.id)}</p>
                      {reservation.notes && <p className="mt-1 max-w-xs whitespace-normal text-xs font-normal text-stone-500">{reservation.notes}</p>}
                    </th>
                    <td className="px-4 py-4 align-top text-stone-700">{reservation.member.name}</td>
                    <td className="px-4 py-4 align-top text-stone-700">
                      <p>{reservation.outlet?.name ?? "Outlet tidak tersedia"}</p>
                      {reservation.outlet?.isDemoLocation && <p className="mt-1 text-xs text-amber-800">Lokasi demo — bukan alamat resmi</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">
                      <time dateTime={`${reservation.arrivalDate}T${reservation.arrivalTime}:00+07:00`}>
                        {reservationDateFormatter.format(new Date(`${reservation.arrivalDate}T00:00:00+07:00`))} · {reservation.arrivalTime} WIB
                      </time>
                    </td>
                    <td className="px-4 py-4 align-top text-stone-600">
                      <p>{reservation.tableType?.label ?? "Jenis meja tidak tersedia"}</p>
                      <p className="mt-1 text-xs">{reservation.guestCount} tamu</p>
                    </td>
                    <td className="px-5 py-4 align-top sm:px-6">
                      <StatusBadge status={reservation.status} label={reservationStatusLabels[reservation.status]} />
                      <AdminStatusControl
                        resource="reservations"
                        recordId={reservation.id}
                        currentStatus={reservation.status}
                        options={getAdminReservationStatusTransitions(reservation.status).map((status) => ({
                          value: status,
                          label: reservationStatusLabels[status],
                        }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="status" className="px-5 py-10 text-center sm:px-6">
            <CalendarDays aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
            <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada reservasi tersimpan</h3>
          </div>
        )}
      </section>
    </main>
  );
}
