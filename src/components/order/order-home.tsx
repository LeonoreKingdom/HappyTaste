"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";

import {
  menuCategories,
  type MenuCategory,
  type MenuItem,
} from "@/data/mock-menu";
import type { MockTable } from "@/data/mock-tables";
import { useOrderCart } from "@/components/order/order-cart-provider";

type OrderMode = "dine-in" | "advance";
type CategoryFilter = "Semua" | MenuCategory;

type OrderHomeProps = {
  menus: MenuItem[];
  initialMode: OrderMode | null;
  initialTable: MockTable | null;
};

const categoryFilters: CategoryFilter[] = ["Semua", ...menuCategories];
const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const orderModes: {
  id: OrderMode;
  title: string;
  description: string;
  label: string;
  Icon: typeof Store;
}[] = [
  {
    id: "dine-in",
    title: "Makan di tempat",
    description: "Pesan dengan QR yang tersedia di meja resto.",
    label: "Scan QR meja",
    Icon: Store,
  },
  {
    id: "advance",
    title: "Pesan lebih dulu",
    description: "Member dapat memesan sebelum tiba di resto.",
    label: "Khusus member",
    Icon: Clock3,
  },
];

export function OrderHome({ menus, initialMode, initialTable }: OrderHomeProps) {
  const { quantities, changeQuantity } = useOrderCart();
  const [selectedMode, setSelectedMode] = useState<OrderMode | null>(
    initialTable ? "dine-in" : initialMode,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Semua");

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("id-ID");
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      !normalizedQuery ||
      [menu.name, menu.description, menu.category].some((value) =>
        value.toLocaleLowerCase("id-ID").includes(normalizedQuery),
      );
    const matchesCategory =
      selectedCategory === "Semua" || menu.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const selectedMenus = menus.flatMap((menu) => {
    const quantity = quantities[menu.id] ?? 0;
    return quantity > 0 ? [{ menu, quantity }] : [];
  });
  const itemCount = selectedMenus.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedMenus.reduce(
    (total, item) => total + item.menu.price * item.quantity,
    0,
  );
  const cartHref = `/order/cart?mode=${selectedMode ?? "dine-in"}${
    initialTable ? `&table=${encodeURIComponent(initialTable.id)}` : ""
  }`;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="transition-colors hover:text-orange-700">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-medium text-stone-800">
          Pesan makanan
        </span>
      </div>

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-950 via-orange-950 to-orange-800 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl"
        />
        <a
          href="#order-summary"
          aria-label={`Buka keranjang, ${itemCount} item, subtotal ${rupiah.format(subtotal)}`}
          className="absolute right-6 top-6 hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-orange-100 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 lg:block"
        >
          <ShoppingBag aria-hidden="true" className="h-8 w-8" />
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-orange-900"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </a>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-orange-100">
          <Sparkles className="h-4 w-4" />
          PEMESANAN HAPPYTASTE
        </p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          Makan enak, pesan dengan cara yang nyaman.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
          Pilih cara pesan, temukan menu favorit, lalu susun pesananmu. Untuk saat
          ini, pilihan menu dan keranjang berjalan sebagai simulasi.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium text-orange-50 sm:text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <Check className="h-4 w-4" /> Tanpa antre di kasir
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <Utensils className="h-4 w-4" /> Menu favorit dalam satu tempat
          </span>
        </div>
      </section>

      <section aria-labelledby="order-mode-title" className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-orange-700">LANGKAH 1</p>
          <h2 id="order-mode-title" className="mt-1 text-2xl font-bold text-stone-900">
            Pilih cara pesan
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Cara pesan menentukan bagaimana pesananmu dipersiapkan.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {orderModes.map(({ id, title, description, label, Icon }) => {
            const isSelected = selectedMode === id;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedMode(id);
                }}
                className={`flex min-h-36 items-start gap-4 rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-orange-600 text-white"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-semibold text-stone-900">
                    {title}
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-stone-500 ring-1 ring-stone-200">
                      {label}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-stone-600">
                    {description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-1 h-5 w-5 shrink-0 rounded-full border ${
                    isSelected
                      ? "border-orange-600 bg-orange-600 shadow-[inset_0_0_0_4px_white]"
                      : "border-stone-300 bg-white"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {selectedMode ? (
          <div className="space-y-3 rounded-xl border border-orange-100 bg-orange-50/70 p-4 text-sm leading-6 text-stone-700">
            <p className="flex items-start gap-2">
              {selectedMode === "dine-in" ? (
                <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
              ) : (
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
              )}
              {selectedMode === "dine-in"
                ? initialTable
                  ? `${initialTable.label} dipilih dari QR demo. Validasi meja server belum tersedia.`
                  : "Pemesanan di tempat memerlukan QR meja. Scan kode meja sebelum memilih menu."
                : "Pemesanan lebih dulu khusus member. Login dan pengiriman pesanan belum terhubung pada simulasi ini."}
            </p>
            {selectedMode === "dine-in" && !initialTable ? (
              <Link
                href="/order/scan"
                className="ml-6 inline-flex font-semibold text-orange-800 underline decoration-orange-300 underline-offset-4 hover:text-orange-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
              >
                Buka pemindai QR meja
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="menu-order-title" className="min-w-0 space-y-6">
          <div>
            <p className="text-sm font-semibold text-orange-700">LANGKAH 2</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="menu-order-title" className="text-2xl font-bold text-stone-900">
                  Pilih menu
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  {filteredMenus.length} dari {menus.length} menu tersedia
                </p>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                Jelajah menu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="order-menu-search" className="sr-only">
              Cari menu untuk pesanan
            </label>
            <input
              id="order-menu-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari nasi goreng, kopi, dan lainnya"
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
            <div
              role="group"
              aria-label="Filter kategori menu"
              className="flex flex-wrap gap-2"
            >
              {categoryFilters.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                      isSelected
                        ? "bg-orange-700 text-white"
                        : "bg-orange-100 text-orange-900 hover:bg-orange-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredMenus.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-8 text-center text-stone-600">
              Menu tidak ditemukan. Coba kata kunci atau kategori lain.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredMenus.map((menu) => {
                const quantity = quantities[menu.id] ?? 0;

                return (
                  <article
                    key={menu.id}
                    className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
                  >
                    <Link
                      href={`/menu/${menu.id}`}
                      className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-orange-200"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-orange-50">
                        <Image
                          src={menu.image}
                          alt={menu.name}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-orange-800 shadow-sm">
                          {menu.category}
                        </span>
                      </div>
                      <div className="px-4 pb-1 pt-4">
                        <h3 className="font-semibold text-stone-900 group-hover:text-orange-700">
                          {menu.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-stone-600">
                          {menu.description}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3">
                      <p className="font-bold text-stone-900">{rupiah.format(menu.price)}</p>
                      {quantity === 0 ? (
                        <button
                          type="button"
                          disabled={!selectedMode}
                          onClick={() => changeQuantity(menu.id, 1)}
                          aria-label={`Tambah ${menu.name} ke pesanan`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:bg-stone-300"
                        >
                          <Plus className="h-4 w-4" /> Tambah
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 p-1">
                          <button
                            type="button"
                            onClick={() => changeQuantity(menu.id, -1)}
                            aria-label={`Kurangi ${menu.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-orange-800 shadow-sm hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span
                            role="status"
                            aria-live="polite"
                            aria-label={`${quantity} ${menu.name}`}
                            className="min-w-5 text-center text-sm font-bold text-stone-900"
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(menu.id, 1)}
                            aria-label={`Tambah ${menu.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-orange-800 shadow-sm hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {!selectedMode ? (
            <p className="text-sm text-stone-500">
              Pilih cara pesan terlebih dahulu untuk menambahkan menu.
            </p>
          ) : null}
        </section>

        <aside
          id="order-summary"
          aria-labelledby="order-summary-title"
          tabIndex={-1}
          className="scroll-mt-24 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-24"
        >
          <p className="text-sm font-semibold text-orange-700">LANGKAH 3</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h2 id="order-summary-title" className="text-xl font-bold text-stone-900">
              Ringkasan pesanan
            </h2>
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-900">
              {itemCount} item
            </span>
          </div>

          {selectedMenus.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-orange-200 bg-orange-50/60 px-4 py-7 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-orange-400" />
              <p className="mt-3 text-sm font-semibold text-stone-800">
                Pesananmu masih kosong
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-600">
                Pilih cara pesan, lalu tambahkan menu favoritmu.
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-orange-100">
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
          )}

          <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-4 text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span className="text-lg font-bold text-stone-900">{rupiah.format(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            Total akhir dan biaya lainnya akan dihitung saat checkout tersedia.
          </p>
          {itemCount === 0 ? (
            <button
              type="button"
              disabled
              className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-stone-300 px-4 py-3 font-semibold text-white"
            >
              Tinjau pesanan <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={cartHref}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              Tinjau pesanan <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </aside>
      </div>

      {itemCount > 0 ? (
        <a
          href="#order-summary"
          aria-label={`Buka keranjang, ${itemCount} item, subtotal ${rupiah.format(subtotal)}`}
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-3 rounded-full bg-orange-700 py-3 pl-4 pr-5 text-white shadow-xl transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 lg:hidden"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <ShoppingBag aria-hidden="true" className="h-5 w-5" />
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-orange-900"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          </span>
          <span className="text-left text-sm font-semibold">
            Keranjang
            <span className="block text-xs font-medium text-orange-100">
              {rupiah.format(subtotal)}
            </span>
          </span>
        </a>
      ) : null}
    </main>
  );
}
