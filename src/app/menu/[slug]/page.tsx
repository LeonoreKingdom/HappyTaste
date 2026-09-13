import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockMenus } from "@/data/mock-menu";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function generateStaticParams() {
  return mockMenus.map((menu) => ({ slug: menu.id }));
}

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = mockMenus.find((item) => item.id === slug);

  if (!menu) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/menu"
        className="text-sm font-semibold text-orange-700 hover:text-orange-900"
      >
        ← Kembali ke menu
      </Link>
      <div className="mt-8 grid overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm md:grid-cols-2">
        <div className="relative min-h-72 bg-orange-50 md:min-h-[520px]"><Image src={menu.image} alt={menu.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority /></div>
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <p className="text-sm font-semibold tracking-[0.18em] text-orange-600 uppercase">{menu.category}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900">{menu.name}</h1>
          <p className="mt-5 text-base leading-7 text-stone-600">{menu.description}</p>
          <p className="mt-7 text-2xl font-bold text-orange-700">{rupiah.format(menu.price)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-orange-100 pt-6 text-sm"><div><dt className="text-stone-500">Porsi</dt><dd className="mt-1 font-semibold text-stone-900">{menu.portion}</dd></div><div><dt className="text-stone-500">Bahan utama</dt><dd className="mt-1 font-semibold text-stone-900">{menu.ingredients.join(", ")}</dd></div></dl>
        </div>
      </div>
    </main>
  );
}
