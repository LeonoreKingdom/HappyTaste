import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Utensils } from "lucide-react";

import type { MenuListItem } from "@/db/queries/menus";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Kelola Menu - HappyTaste Resto",
  description: "Daftar menu tersimpan untuk panel pengelola HappyTaste Resto.",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function AdminMenuPage() {
  await requireAdminPage();

  let menus: MenuListItem[];

  try {
    const { getMenuList } = await import("@/db/queries/menus");
    menus = await getMenuList();
  } catch (error) {
    console.error("Failed to load admin menu list", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Katalog</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Kelola menu</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Daftar menu tidak dapat dimuat saat ini. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  const categoryCounts = menus.reduce<Record<string, number>>((counts, menu) => {
    counts[menu.category.name] = (counts[menu.category.name] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <main className="space-y-5">
      <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Katalog</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Kelola menu</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Daftar menu yang tersimpan di katalog HappyTaste.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="w-fit rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700">
            {menus.length} menu
          </p>
          <Link
            href="/admin/menu/tambah"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Tambah menu
          </Link>
        </div>
      </header>

      <section aria-label="Jumlah menu per kategori" className="grid gap-3 sm:grid-cols-3">
        {Object.entries(categoryCounts).map(([category, total]) => (
          <div key={category} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-stone-500">{category}</p>
            <p className="mt-1 text-xl font-bold text-stone-950">{total}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="menu-list-heading" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4 sm:px-6">
          <h2 id="menu-list-heading" className="text-lg font-bold text-stone-950">Daftar menu</h2>
          <p className="mt-1 text-sm text-stone-500">Informasi dibaca dari katalog tersimpan.</p>
        </div>

        {menus.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="sr-only">Daftar menu pada katalog HappyTaste</caption>
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">Menu</th>
                  <th scope="col" className="px-4 py-3">Kategori</th>
                  <th scope="col" className="px-4 py-3">Porsi</th>
                  <th scope="col" className="px-4 py-3">Bahan</th>
                  <th scope="col" className="px-5 py-3 text-right sm:px-6">Harga</th>
                  <th scope="col" className="px-5 py-3 text-right sm:px-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {menus.map((menu) => (
                  <tr key={menu.id}>
                    <th scope="row" className="max-w-sm px-5 py-4 align-top sm:px-6">
                      <p className="font-semibold text-stone-900">{menu.name}</p>
                      <p className="mt-1 whitespace-normal text-xs leading-5 text-stone-500">{menu.description}</p>
                    </th>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">{menu.category.name}</td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-stone-600">{menu.portion}</td>
                    <td className="max-w-xs whitespace-normal px-4 py-4 align-top text-stone-600">
                      {menu.ingredients.join(", ")}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right align-top font-semibold text-stone-900 sm:px-6">
                      {currencyFormatter.format(menu.price)}
                    </td>
                    <td className="px-5 py-4 text-right align-top sm:px-6">
                      <Link
                        href={`/admin/menu/${encodeURIComponent(menu.id)}/edit`}
                        aria-label={`Ubah ${menu.name}`}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 text-xs font-semibold text-stone-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                      >
                        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                        Ubah
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div role="status" className="px-5 py-12 text-center sm:px-6">
            <Utensils aria-hidden="true" className="mx-auto h-8 w-8 text-stone-400" />
            <h3 className="mt-3 text-sm font-semibold text-stone-900">Belum ada menu tersimpan</h3>
            <p className="mt-1 text-sm text-stone-500">Menu akan tampil di sini setelah tersedia di katalog.</p>
          </div>
        )}
      </section>
    </main>
  );
}
