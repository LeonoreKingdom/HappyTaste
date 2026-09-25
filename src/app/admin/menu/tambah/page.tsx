import type { Metadata } from "next";

import { MenuEditorForm } from "@/components/admin/menu-editor-form";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Tambah Menu - HappyTaste Resto",
  description: "Tambahkan menu ke katalog HappyTaste Resto.",
};

type MenuCategoryOption = {
  id: string;
  name: string;
};

export default async function AddAdminMenuPage() {
  await requireAdminPage();

  let categories: MenuCategoryOption[];
  try {
    const { getMenuCategories } = await import("@/db/queries/menus");
    categories = await getMenuCategories();
  } catch (error) {
    console.error("Failed to load menu categories for creation", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Katalog</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Tambah menu</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Form tidak dapat dimuat karena data kategori gagal dibaca. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Katalog</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Tambah menu</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Lengkapi detail menu baru untuk katalog HappyTaste.</p>
      </header>
      <MenuEditorForm categories={categories} />
    </main>
  );
}
