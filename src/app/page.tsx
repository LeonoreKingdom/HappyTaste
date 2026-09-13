import Image from "next/image";

const mockMenus = [
  {
    id: "nasi-goreng-rempah",
    name: "Nasi Goreng Rempah",
    description: "Nasi goreng wangi dengan ayam suwir, telur, dan acar segar.",
    price: 42000,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ayam-bakar-madu",
    name: "Ayam Bakar Madu",
    description: "Ayam panggang berbumbu madu dengan sambal dan lalapan.",
    price: 48000,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beef-burger",
    name: "Happy Beef Burger",
    description: "Patty sapi juicy, keju leleh, selada renyah, dan kentang goreng.",
    price: 52000,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "spaghetti-bolognese",
    name: "Spaghetti Bolognese",
    description: "Pasta al dente dengan saus tomat daging yang kaya rasa.",
    price: 47000,
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    description: "Selada segar, ayam panggang, crouton, dan dressing creamy.",
    price: 39000,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "es-kopi-susu",
    name: "Es Kopi Susu Gula Aren",
    description: "Kopi espresso, susu segar, dan manis gula aren yang lembut.",
    price: 26000,
    image:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
  },
];

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function Home() {
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockMenus.map((menu, index) => (
            <article
              key={menu.id}
              className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                <Image
                  src={menu.image}
                  alt={menu.name}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                  loading={index < 3 ? "eager" : "lazy"}
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-stone-900">{menu.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-stone-600">
                  {menu.description}
                </p>
                <p className="mt-5 text-lg font-bold text-orange-700">
                  {rupiah.format(menu.price)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
