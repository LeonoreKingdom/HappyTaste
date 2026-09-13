"use client";

import { useMemo, useState } from "react";

import { menuCategories, mockMenus, type MenuCategory } from "@/data/mock-menu";
import { MenuCard } from "@/components/menu/menu-card";

const categoryFilters = ["Semua", ...menuCategories] as const;
type CategoryFilter = (typeof categoryFilters)[number];

type MenuBrowserProps = {
  idPrefix?: string;
  showHeading?: boolean;
};

export function MenuBrowser({
  idPrefix = "menu-browser",
  showHeading = true,
}: MenuBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Semua");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("id-ID");

  const filteredMenus = useMemo(
    () =>
      mockMenus.filter((menu) => {
        const matchesSearch =
          !normalizedQuery ||
          [menu.name, menu.description, menu.category].some((value) =>
            value.toLocaleLowerCase("id-ID").includes(normalizedQuery),
          );
        const matchesCategory =
          selectedCategory === "Semua" || menu.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [normalizedQuery, selectedCategory],
  );

  return (
    <section aria-labelledby={`${idPrefix}-title`}>
      {showHeading ? (
        <header className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-orange-600 uppercase">
              HappyTaste Resto
            </p>
            <h1
              id={`${idPrefix}-title`}
              className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl"
            >
              Jelajah Menu Kami
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
              Temukan hidangan favoritmu, dibuat dari bahan pilihan untuk menemani
              setiap momen makan.
            </p>
          </div>
          <p className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
            {mockMenus.length} menu tersedia
          </p>
        </header>
      ) : (
        <h2 id={`${idPrefix}-title`} className="sr-only">
          Jelajah menu HappyTaste
        </h2>
      )}

      <div className="mb-10 max-w-xl">
        <label
          htmlFor={`${idPrefix}-search`}
          className="mb-2 block text-sm font-semibold text-stone-800"
        >
          Cari menu
        </label>
        <input
          id={`${idPrefix}-search`}
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Contoh: nasi goreng atau kopi"
          className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        />
      </div>

      <div
        className="mb-10 flex flex-wrap gap-2"
        aria-label="Filter kategori menu"
      >
        {categoryFilters.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={isSelected}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isSelected
                  ? "bg-orange-600 text-white"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-200"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredMenus.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-8 text-center text-stone-600">
          Menu tidak ditemukan. Coba gunakan kata kunci lain.
        </p>
      ) : (
        <div className="space-y-12">
          {menuCategories.map((category: MenuCategory) => {
            const menusInCategory = filteredMenus.filter(
              (menu) => menu.category === category,
            );
            const categoryId = category.toLocaleLowerCase("id-ID").replace(/\s+/g, "-");

            if (menusInCategory.length === 0) {
              return null;
            }

            return (
              <section key={category} aria-labelledby={`${idPrefix}-${categoryId}`}>
                <h2
                  id={`${idPrefix}-${categoryId}`}
                  className="mb-5 text-2xl font-bold text-stone-900"
                >
                  {category}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {menusInCategory.map((menu, index) => (
                    <MenuCard
                      key={menu.id}
                      menu={menu}
                      prioritizeImage={index < 3}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
