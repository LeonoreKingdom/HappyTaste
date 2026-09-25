"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleDashed,
  Clock3,
  CreditCard,
  QrCode,
  Store,
  UserRound,
} from "lucide-react";

import { useOrderCart, type OrderPaymentMethod } from "@/components/order/order-cart-provider";
import type { MenuItem } from "@/data/mock-menu";

type OrderStatusScreenProps = {
  menus: MenuItem[];
};

const paymentLabels: Record<OrderPaymentMethod, string> = {
  cash: "Tunai di kasir",
  card: "Kartu di kasir",
  qris: "QRIS (simulasi)",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function OrderStatusScreen({ menus }: OrderStatusScreenProps) {
  const { latestMockOrder } = useOrderCart();

  if (!latestMockOrder) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <section
          aria-labelledby="missing-order-title"
          className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm sm:p-10"
        >
          <CircleDashed aria-hidden="true" className="mx-auto h-10 w-10 text-orange-700" />
          <p className="mt-5 text-sm font-semibold tracking-wide text-orange-700">
            STATUS SIMULASI
          </p>
          <h1 id="missing-order-title" className="mt-2 text-2xl font-bold text-stone-950 sm:text-3xl">
            Belum ada konfirmasi di sesi ini
          </h1>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-stone-600">
            Ringkasan status hanya tersedia setelah konfirmasi simulasi dan selama
            sesi halaman pemesanan ini masih aktif. Tidak ada pesanan yang tersimpan
            di server.
          </p>
          <Link
            href="/order"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:w-auto"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali ke pemesanan
          </Link>
        </section>
      </main>
    );
  }

  const selectedMenus = menus.flatMap((menu) => {
    const quantity = latestMockOrder.quantities[menu.id] ?? 0;
    return quantity > 0 ? [{ menu, quantity }] : [];
  });
  const itemCount = selectedMenus.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedMenus.reduce(
    (total, item) => total + item.menu.price * item.quantity,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/order"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke pemesanan
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          STATUS PESANAN · SIMULASI
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Konfirmasi simulasi berhasil
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          Ringkasan ini dibuat di sesi browser sebagai preview. Pesanan belum dikirim
          ke restoran, dan pembayaran maupun status dapur belum diproses.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-6">
          <div
            role="status"
            className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                <Check aria-hidden="true" className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold text-emerald-950">Langkah simulasi selesai</p>
                <h2 className="mt-1 text-xl font-bold text-emerald-950 sm:text-2xl">
                  Pesanan demo {latestMockOrder.code}
                </h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Ini bukan nomor pesanan aktif. Gunakan halaman ini hanya untuk
                  meninjau alur frontend.
                </p>
              </div>
            </div>
          </div>

          <section
            aria-labelledby="mock-status-title"
            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5">
              <p className="text-sm font-semibold text-orange-700">ALUR STATUS</p>
              <h2 id="mock-status-title" className="mt-1 text-xl font-bold text-stone-900">
                Status pesanan simulasi
              </h2>
            </div>
            <ol className="space-y-5">
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-700 text-white">
                  <Check aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-stone-900">Konfirmasi lokal tercatat</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Menu dan pilihan pembayaran tersimpan sementara di halaman ini.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <Clock3 aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-stone-700">Dikirim ke restoran</p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Belum tersedia karena belum ada API pemesanan yang dihubungkan.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <CircleDashed aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-stone-700">Status dapur dan pembayaran</p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Belum ada transaksi atau pembaruan status aktual.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="inline-flex items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Pesan lagi
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 font-semibold text-orange-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Jelajahi menu
            </Link>
          </div>
        </section>

        <aside
          aria-labelledby="status-summary-title"
          className="space-y-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-24"
        >
          <div>
            <p className="text-sm font-semibold text-orange-700">RINGKASAN</p>
            <h2 id="status-summary-title" className="mt-1 text-xl font-bold text-stone-900">
              Pesanan demo
            </h2>
          </div>

          <div className="space-y-3 rounded-xl bg-orange-50 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-stone-900">
              {latestMockOrder.orderMode === "advance" ? (
                <UserRound aria-hidden="true" className="h-4 w-4 text-orange-800" />
              ) : latestMockOrder.tableLabel ? (
                <Store aria-hidden="true" className="h-4 w-4 text-orange-800" />
              ) : (
                <QrCode aria-hidden="true" className="h-4 w-4 text-orange-800" />
              )}
              {latestMockOrder.orderMode === "advance"
                ? "Pesan lebih dulu · khusus member"
                : latestMockOrder.tableLabel
                  ? `Makan di tempat · ${latestMockOrder.tableLabel}`
                  : "Makan di tempat · QR meja"}
            </p>
            <p className="flex items-center gap-2 text-stone-700">
              <CreditCard aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-800" />
              {paymentLabels[latestMockOrder.paymentMethod]}
            </p>
          </div>

          <ul className="divide-y divide-orange-100">
            {selectedMenus.map(({ menu, quantity }) => (
              <li key={menu.id} className="flex justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {menu.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {quantity} × {rupiah.format(menu.price)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-stone-800">
                  {rupiah.format(menu.price * quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-orange-100 pt-4 text-sm">
            <span className="text-stone-600">{itemCount} item</span>
            <span className="text-lg font-bold text-stone-900">{rupiah.format(subtotal)}</span>
          </div>
          <p className="text-xs leading-5 text-stone-500">
            Total ini hanya preview; pajak, biaya layanan, dan pembayaran belum dihitung.
          </p>
        </aside>
      </div>
    </main>
  );
}
