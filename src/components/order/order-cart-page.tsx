"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, QrCode, ShoppingBag, Trash2, UserRound } from "lucide-react";

import type { MenuItem } from "@/data/mock-menu";
import type { MockTable } from "@/data/mock-tables";
import { useOrderCart } from "@/components/order/order-cart-provider";

type OrderMode = "dine-in" | "advance";

type OrderCartPageProps = {
  menus: MenuItem[];
  orderMode: OrderMode | null;
  table: MockTable | null;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function OrderCartPage({ menus, orderMode, table }: OrderCartPageProps) {
  const { quantities, changeQuantity } = useOrderCart();
  const selectedMenus = menus.flatMap((menu) => {
    const quantity = quantities[menu.id] ?? 0;
    return quantity > 0 ? [{ menu, quantity }] : [];
  });
  const itemCount = selectedMenus.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedMenus.reduce(
    (total, item) => total + item.menu.price * item.quantity,
    0,
  );
  const orderQuery = [
    orderMode ? `mode=${orderMode}` : null,
    table ? `table=${encodeURIComponent(table.id)}` : null,
  ]
    .filter(Boolean)
    .join("&");
  const returnHref = orderQuery ? `/order?${orderQuery}` : "/order";
  const confirmationHref = orderQuery
    ? `/order/confirm?${orderQuery}`
    : "/order/confirm";

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href={returnHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali memilih menu
      </Link>

      <header>
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          PESANANMU
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Keranjang pesanan
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-600">
          Periksa menu dan jumlahnya. Keranjang ini masih simulasi dan belum
          disimpan atau dikirim ke server.
        </p>
      </header>

      {selectedMenus.length === 0 ? (
        <section
          aria-labelledby="empty-cart-title"
          className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center shadow-sm sm:py-14"
        >
          <ShoppingBag className="mx-auto h-12 w-12 text-orange-300" />
          <h2 id="empty-cart-title" className="mt-4 text-xl font-bold text-stone-900">
            Keranjangmu masih kosong
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Pilih menu favorit untuk melihat rincian pesananmu di sini.
          </p>
          <Link
            href={returnHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:w-auto"
          >
            Pilih menu
          </Link>
        </section>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="cart-items-title" className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="cart-items-title" className="text-xl font-bold text-stone-900">
                Menu pilihan
              </h2>
              <span className="text-sm text-stone-600">{itemCount} item</span>
            </div>

            <ul className="divide-y divide-orange-100 rounded-2xl border border-orange-100 bg-white px-4 shadow-sm sm:px-6">
              {selectedMenus.map(({ menu, quantity }) => (
                <li key={menu.id} className="flex flex-wrap items-center gap-4 py-5">
                  <Image
                    src={menu.image}
                    alt=""
                    width={96}
                    height={96}
                    sizes="96px"
                    className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-stone-900">{menu.name}</h3>
                    <p className="mt-1 text-sm text-stone-600">
                      {rupiah.format(menu.price)} / item
                    </p>
                    <p className="mt-2 font-bold text-stone-900">
                      {rupiah.format(menu.price * quantity)}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-end">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 p-1">
                      <button
                        type="button"
                        onClick={() => changeQuantity(menu.id, -1)}
                        aria-label={`Kurangi ${menu.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-orange-800 shadow-sm transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span
                        role="status"
                        aria-label={`${quantity} ${menu.name}`}
                        className="min-w-6 text-center text-sm font-bold text-stone-900"
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(menu.id, 1)}
                        aria-label={`Tambah ${menu.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-orange-800 shadow-sm transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => changeQuantity(menu.id, -quantity)}
                      aria-label={`Hapus ${menu.name} dari keranjang`}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href={returnHref}
              className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-orange-800 hover:text-orange-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <Plus className="h-4 w-4" /> Tambah menu lainnya
            </Link>
          </section>

          <aside
            aria-labelledby="cart-summary-title"
            className="space-y-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-24"
          >
            <div>
              <p className="text-sm font-semibold text-orange-700">RINGKASAN</p>
              <h2 id="cart-summary-title" className="mt-1 text-xl font-bold text-stone-900">
                Detail pesanan
              </h2>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4">
              {orderMode === "advance" ? (
                <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-orange-800" />
              ) : (
                <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-orange-800" />
              )}
              <div>
                <p className="font-semibold text-stone-900">
                  {orderMode === "advance"
                    ? "Pesan lebih dulu · khusus member"
                    : orderMode === "dine-in"
                      ? table
                        ? `Makan di tempat · ${table.label}`
                        : "Makan di tempat · QR meja belum dipilih"
                      : "Cara pesan belum dipilih"}
                </p>
                <p className="mt-1 text-xs leading-5 text-stone-600">
                  {orderMode === "advance"
                    ? "Login member dan pengiriman pesanan belum tersedia di simulasi ini."
                    : orderMode === "dine-in"
                      ? table
                        ? "Meja berasal dari kode demo dan belum diverifikasi server."
                        : "Pindai QR meja HappyTaste sebelum melanjutkan pesanan di tempat."
                      : "Pilih cara pesan dari halaman pemesanan sebelum melanjutkan."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-orange-100 pt-4 text-sm">
              <span className="text-stone-600">{itemCount} item</span>
              <span className="text-lg font-bold text-stone-900">
                {rupiah.format(subtotal)}
              </span>
            </div>
            <p className="text-xs leading-5 text-stone-500">
              Total akhir dan biaya lainnya akan dihitung saat proses konfirmasi tersedia.
            </p>

            {orderMode === "dine-in" && !table ? (
              <Link
                href="/order/scan"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                <QrCode className="h-4 w-4" /> Scan QR meja
              </Link>
            ) : orderMode ? (
              <Link
                href={confirmationHref}
                className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Lanjut ke konfirmasi
              </Link>
            ) : (
              <Link
                href={returnHref}
                className="inline-flex w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Pilih cara pesan
              </Link>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
