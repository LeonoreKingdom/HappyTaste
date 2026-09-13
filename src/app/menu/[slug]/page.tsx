import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const menuDetails = {
  "nasi-goreng-rempah": { name: "Nasi Goreng Rempah", description: "Nasi goreng wangi dengan ayam suwir, telur, dan acar segar.", price: 42000, category: "Makanan Utama", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80", ingredients: ["Nasi", "Ayam suwir", "Telur", "Rempah pilihan"], portion: "1 porsi" },
  "ayam-bakar-madu": { name: "Ayam Bakar Madu", description: "Ayam panggang berbumbu madu dengan sambal dan lalapan.", price: 48000, category: "Makanan Utama", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80", ingredients: ["Ayam", "Madu", "Sambal", "Lalapan"], portion: "1 potong" },
  "beef-burger": { name: "Happy Beef Burger", description: "Patty sapi juicy, keju leleh, selada renyah, dan kentang goreng.", price: 52000, category: "Camilan", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80", ingredients: ["Patty sapi", "Keju", "Selada", "Kentang"], portion: "1 set" },
  "spaghetti-bolognese": { name: "Spaghetti Bolognese", description: "Pasta al dente dengan saus tomat daging yang kaya rasa.", price: 47000, category: "Makanan Utama", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80", ingredients: ["Spaghetti", "Daging sapi", "Tomat", "Parmesan"], portion: "1 porsi" },
  "caesar-salad": { name: "Caesar Salad", description: "Selada segar, ayam panggang, crouton, dan dressing creamy.", price: 39000, category: "Camilan", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80", ingredients: ["Selada", "Ayam panggang", "Crouton", "Dressing"], portion: "1 mangkuk" },
  "es-kopi-susu": { name: "Es Kopi Susu Gula Aren", description: "Kopi espresso, susu segar, dan manis gula aren yang lembut.", price: 26000, category: "Minuman", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1200&q=80", ingredients: ["Espresso", "Susu segar", "Gula aren"], portion: "350 ml" },
} as const;

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function generateStaticParams() {
  return Object.keys(menuDetails).map((slug) => ({ slug }));
}

export default async function MenuDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const menu = menuDetails[slug as keyof typeof menuDetails];

  if (!menu) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <Link href="/" className="text-sm font-semibold text-orange-700 hover:text-orange-900">← Kembali ke menu</Link>
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
