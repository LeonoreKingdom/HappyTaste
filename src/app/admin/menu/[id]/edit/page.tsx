import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuEditorForm } from "@/components/admin/menu-editor-form";
import type { MenuListItem } from "@/db/queries/menus";
import { requireAdminPage } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Ubah Menu - HappyTaste Resto",
  description: "Ubah informasi menu di katalog HappyTaste Resto.",
};

type MenuCategoryOption = {
  id: string;
  name: string;
};

export default async function EditAdminMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  let menu: MenuListItem | null;
  let categories: MenuCategoryOption[];
  try {
    const { getMenuById, getMenuCategories } = await import("@/db/queries/menus");
    [menu, categories] = await Promise.all([getMenuById(id), getMenuCategories()]);
  } catch (error) {
    console.error("Failed to load menu for editing", error);

    return (
      <main className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Katalog</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Ubah menu</h1>
        </header>
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Detail menu tidak dapat dimuat saat ini. Coba muat ulang halaman.
        </div>
      </main>
    );
  }

  if (!menu) notFound();

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Panel pengelola · Katalog</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">Ubah menu</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Perbarui informasi {menu.name}.</p>
      </header>
      <MenuEditorForm categories={categories} initialMenu={menu} />
    </main>
  );
}
