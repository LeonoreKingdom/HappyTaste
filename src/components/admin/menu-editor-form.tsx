"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MenuCategoryOption = {
  id: string;
  name: string;
};

type MenuEditorInitial = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategoryOption;
  imageUrl: string;
  ingredients: string[];
  portion: string;
};

type MenuEditorFormProps = {
  categories: MenuCategoryOption[];
  initialMenu?: MenuEditorInitial;
};

export function MenuEditorForm({ categories, initialMenu }: MenuEditorFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialMenu?.name ?? "");
  const [description, setDescription] = useState(initialMenu?.description ?? "");
  const [price, setPrice] = useState(initialMenu ? String(initialMenu.price) : "");
  const [categoryId, setCategoryId] = useState(
    initialMenu?.category.id ?? categories[0]?.id ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initialMenu?.imageUrl ?? "");
  const [portion, setPortion] = useState(initialMenu?.portion ?? "");
  const [ingredients, setIngredients] = useState(initialMenu?.ingredients.join("\n") ?? "");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || categories.length === 0) return;

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const endpoint = initialMenu
          ? `/api/admin/menus/${encodeURIComponent(initialMenu.id)}`
          : "/api/admin/menus";
        const response = await fetch(endpoint, {
          method: initialMenu ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            categoryId,
            imageUrl,
            portion,
            ingredients: ingredients.split("\n").map((ingredient) => ingredient.trim()).filter(Boolean),
          }),
        });
        const result: { success?: boolean; error?: string } = await response.json();

        if (!response.ok || !result.success) {
          setErrorMessage(result.error ?? "Menu tidak dapat disimpan. Periksa kembali data yang diisi.");
          return;
        }

        router.push("/admin/menu");
        router.refresh();
      } catch {
        setErrorMessage("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      {categories.length === 0 && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Kategori menu belum tersedia. Tambahkan kategori terlebih dahulu sebelum menyimpan menu.
        </div>
      )}
      {errorMessage && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="menu-name" className="mb-1.5 block text-sm font-semibold text-stone-800">Nama menu</label>
          <input
            id="menu-name"
            name="name"
            type="text"
            maxLength={120}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="menu-description" className="mb-1.5 block text-sm font-semibold text-stone-800">Deskripsi</label>
          <textarea
            id="menu-description"
            name="description"
            rows={3}
            maxLength={1000}
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          />
        </div>

        <div>
          <label htmlFor="menu-price" className="mb-1.5 block text-sm font-semibold text-stone-800">Harga (Rupiah)</label>
          <input
            id="menu-price"
            name="price"
            type="number"
            min="1"
            step="1"
            required
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          />
        </div>

        <div>
          <label htmlFor="menu-category" className="mb-1.5 block text-sm font-semibold text-stone-800">Kategori</label>
          <select
            id="menu-category"
            name="categoryId"
            required
            disabled={categories.length === 0}
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:bg-stone-100"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="menu-portion" className="mb-1.5 block text-sm font-semibold text-stone-800">Porsi / ukuran</label>
          <input
            id="menu-portion"
            name="portion"
            type="text"
            maxLength={80}
            required
            value={portion}
            onChange={(event) => setPortion(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          />
        </div>

        <div>
          <label htmlFor="menu-image-url" className="mb-1.5 block text-sm font-semibold text-stone-800">URL gambar</label>
          <input
            id="menu-image-url"
            name="imageUrl"
            type="text"
            maxLength={2048}
            required
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            autoComplete="url"
            placeholder="https://images.unsplash.com/... atau /images/menu.jpg"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          />
          <p className="mt-1 text-xs text-stone-500">Gunakan HTTPS images.unsplash.com atau path gambar lokal seperti /images/menu.jpg.</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="menu-ingredients" className="mb-1.5 block text-sm font-semibold text-stone-800">Bahan</label>
          <textarea
            id="menu-ingredients"
            name="ingredients"
            rows={4}
            required
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            aria-describedby="menu-ingredients-hint"
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          />
          <p id="menu-ingredients-hint" className="mt-1 text-xs text-stone-500">Satu bahan per baris, maksimal 20 bahan.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:justify-end">
        <Link
          href="/admin/menu"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending || categories.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-700 px-5 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Menyimpan…" : initialMenu ? "Simpan perubahan" : "Simpan menu"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{isPending ? "Menyimpan perubahan menu." : ""}</p>
    </form>
  );
}
