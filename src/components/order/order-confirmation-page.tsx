"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { MenuItem } from "@/data/mock-menu";
import type { MockTable } from "@/data/mock-tables";
import {
  type OrderMode,
  type OrderPaymentMethod,
  useOrderCart,
} from "@/components/order/order-cart-provider";

type PaymentOption = {
  id: OrderPaymentMethod;
  title: string;
  description: string;
  Icon: typeof Banknote;
};

type OrderConfirmationPageProps = {
  menus: MenuItem[];
  orderMode: OrderMode | null;
  table: MockTable | null;
};

const paymentOptions: PaymentOption[] = [
  {
    id: "cash",
    title: "Tunai di kasir",
    description: "Bayar langsung di outlet setelah pesanan siap.",
    Icon: Banknote,
  },
  {
    id: "card",
    title: "Kartu di kasir",
    description: "Pilih kartu debit atau kredit saat di outlet; detail kartu tidak diminta di sini.",
    Icon: CreditCard,
  },
  {
    id: "qris",
    title: "QRIS",
    description: "Metode ini hanya dipilih di simulasi; tidak ada QR pembayaran yang dibuat.",
    Icon: QrCode,
  },
];

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function OrderConfirmationPage({
  menus,
  orderMode,
  table,
}: OrderConfirmationPageProps) {
  const router = useRouter();
  const { quantities, confirmMockOrder } = useOrderCart();
  const [selectedPayment, setSelectedPayment] =
    useState<OrderPaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedMenus = menus.flatMap((menu) => {
    const quantity = quantities[menu.id] ?? 0;
    return quantity > 0 ? [{ menu, quantity }] : [];
  });
  const itemCount = selectedMenus.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedMenus.reduce(
    (total, item) => total + item.menu.price * item.quantity,
    0,
  );
  const canConfirm =
    orderMode === "advance" || (orderMode === "dine-in" && table !== null);
  const orderQuery = [
    orderMode ? `mode=${orderMode}` : null,
    table ? `table=${encodeURIComponent(table.id)}` : null,
  ]
    .filter(Boolean)
    .join("&");
  const cartHref = orderQuery ? `/order/cart?${orderQuery}` : "/order/cart";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (itemCount > 0 && canConfirm && orderMode && selectedPayment && !isSubmitting) {
      setIsSubmitting(true);
      confirmMockOrder({
        quantities: Object.fromEntries(
          selectedMenus.map(({ menu, quantity }) => [menu.id, quantity]),
        ),
        orderMode,
        tableLabel: table?.label ?? null,
        paymentMethod: selectedPayment,
      });
      router.push("/order/status");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href={cartHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke keranjang
      </Link>

      <header>
        <p className="text-sm font-semibold tracking-wide text-orange-700">
          LANGKAH TERAKHIR · SIMULASI
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Konfirmasi pesanan
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-600">
          Periksa ringkasan dan pilih cara pembayaran. Belum ada pesanan atau
          pembayaran yang dikirim ke server.
        </p>
      </header>

      {itemCount === 0 ? (
        <section
          aria-labelledby="empty-confirmation-title"
          className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center shadow-sm sm:py-14"
        >
          <h2 id="empty-confirmation-title" className="text-xl font-bold text-stone-900">
            Keranjangmu masih kosong
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
            Tambahkan menu terlebih dahulu sebelum memilih pembayaran.
          </p>
          <Link
            href="/order"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:w-auto"
          >
            Kembali ke pemesanan
          </Link>
        </section>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {canConfirm ? (
              <fieldset className="space-y-3">
                <legend className="text-xl font-bold text-stone-900">
                  Pilih metode pembayaran
                </legend>
                <p className="text-sm leading-6 text-stone-600">
                  Pilihan ini tidak memproses transaksi selama fitur masih berupa mock.
                </p>
                <div className="mt-4 grid gap-3">
                  {paymentOptions.map(({ id, title, description, Icon }) => {
                    const isSelected = selectedPayment === id;

                    return (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition focus-within:ring-4 focus-within:ring-orange-200 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 shadow-sm"
                            : "border-stone-200 bg-white hover:border-orange-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={id}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedPayment(id);
                          }}
                          className="mt-1 h-4 w-4 accent-orange-700"
                        />
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 font-semibold text-stone-900">
                            {title}
                            {isSelected ? (
                              <Check aria-hidden="true" className="h-4 w-4 text-orange-700" />
                            ) : null}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-stone-600">
                            {description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-950">
                  {orderMode === "dine-in"
                    ? "Scan QR meja sebelum memilih metode pembayaran."
                    : "Pilih cara pesan sebelum memilih metode pembayaran."}
                </p>
                <Link
                  href={orderMode === "dine-in" ? "/order/scan" : "/order"}
                  className="mt-3 inline-flex font-semibold text-orange-900 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                >
                  {orderMode === "dine-in" ? "Scan QR meja" : "Pilih cara pesan"}
                </Link>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-stone-600" />
              <p className="text-sm leading-6 text-stone-600">
                Jangan masukkan nomor kartu, PIN, atau kode OTP. Pembayaran belum
                terhubung ke penyedia mana pun.
              </p>
            </div>

            <button
              type="submit"
              disabled={!canConfirm || !selectedPayment || isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto"
            >
              {isSubmitting ? "Membuka status pesanan..." : "Konfirmasi simulasi"}
            </button>
          </form>

          <aside
            aria-labelledby="confirmation-summary-title"
            className="space-y-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-24"
          >
            <div>
              <p className="text-sm font-semibold text-orange-700">RINGKASAN</p>
              <h2 id="confirmation-summary-title" className="mt-1 text-xl font-bold text-stone-900">
                Pesananmu
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="flex items-center gap-2 font-semibold text-stone-900">
                {orderMode === "advance" ? (
                  <UserRound aria-hidden="true" className="h-5 w-5 text-orange-800" />
                ) : (
                  <QrCode aria-hidden="true" className="h-5 w-5 text-orange-800" />
                )}
                {orderMode === "advance"
                  ? "Pesan lebih dulu · khusus member"
                  : orderMode === "dine-in"
                    ? table
                      ? `Makan di tempat · ${table.label}`
                      : "Makan di tempat · QR belum dipilih"
                    : "Cara pesan belum dipilih"}
              </p>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                {orderMode === "advance"
                  ? "Sesi member diwajibkan untuk pesan lebih dulu; konfirmasi ini tetap simulasi dan tidak membuat pesanan."
                  : orderMode === "dine-in"
                    ? table
                      ? "Meja demo belum diverifikasi server."
                      : "Pindai QR meja sebelum pemesanan di tempat."
                    : "Pilih cara pesan dari halaman pemesanan."}
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
              <span className="text-lg font-bold text-stone-900">
                {rupiah.format(subtotal)}
              </span>
            </div>
            <p className="text-xs leading-5 text-stone-500">
              Pajak, biaya layanan, dan total final belum dihitung di simulasi ini.
            </p>
            <Link
              href={cartHref}
              className="inline-flex w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-semibold text-orange-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Ubah keranjang
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
