"use client";

import { useState } from "react";

import { MenuCard } from "@/components/menu/menu-card";

const menuCategories = ["Makanan Utama", "Camilan", "Minuman"] as const;

const mockMenus = [
  {
    id: "nasi-goreng-rempah",
    name: "Nasi Goreng Rempah",
    description: "Nasi goreng wangi dengan ayam suwir, telur, dan acar segar.",
    price: 42000,
    category: "Makanan Utama",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ayam-bakar-madu",
    name: "Ayam Bakar Madu",
    description: "Ayam panggang berbumbu madu dengan sambal dan lalapan.",
    price: 48000,
    category: "Makanan Utama",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beef-burger",
    name: "Happy Beef Burger",
    description: "Patty sapi juicy, keju leleh, selada renyah, dan kentang goreng.",
    price: 52000,
    category: "Camilan",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "spaghetti-bolognese",
    name: "Spaghetti Bolognese",
    description: "Pasta al dente dengan saus tomat daging yang kaya rasa.",
    price: 47000,
    category: "Makanan Utama",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    description: "Selada segar, ayam panggang, crouton, dan dressing creamy.",
    price: 39000,
    category: "Camilan",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "es-kopi-susu",
    name: "Es Kopi Susu Gula Aren",
    description: "Kopi espresso, susu segar, dan manis gula aren yang lembut.",
    price: 26000,
    category: "Minuman",
    image:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("id-ID");
  const filteredMenus = mockMenus.filter((menu) => {
    if (!normalizedQuery) {
      return true;
    }

    return [menu.name, menu.description, menu.category].some((value) =>
      value.toLocaleLowerCase("id-ID").includes(normalizedQuery),
    );
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-orange-600 uppercase">
            HappyTaste Resto
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
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

      <section aria-labelledby="menu-title">
        <h2 id="menu-title" className="sr-only">
          Daftar menu HappyTaste
        </h2>
        <div className="mb-10 max-w-xl">
          <label
            htmlFor="menu-search"
            className="mb-2 block text-sm font-semibold text-stone-800"
          >
            Cari menu
          </label>
          <input
            id="menu-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Contoh: nasi goreng atau kopi"
            className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {filteredMenus.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-8 text-center text-stone-600">
            Menu tidak ditemukan. Coba gunakan kata kunci lain.
          </p>
        ) : (
          <div className="space-y-12">
            {menuCategories.map((category) => {
              const menusInCategory = filteredMenus.filter(
                (menu) => menu.category === category,
              );

              if (menusInCategory.length === 0) {
                return null;
              }

              return (
                <section key={category} aria-labelledby={`category-${category}`}>
                  <h3
                    id={`category-${category}`}
                    className="mb-5 text-2xl font-bold text-stone-900"
                  >
                    {category}
                  </h3>
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
    </main>
  );
}
