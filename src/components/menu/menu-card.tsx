import Image from "next/image";

export type MenuCardItem = {
  name: string;
  description: string;
  price: number;
  image: string;
};

type MenuCardProps = {
  menu: MenuCardItem;
  prioritizeImage?: boolean;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function MenuCard({ menu, prioritizeImage = false }: MenuCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
        <Image
          src={menu.image}
          alt={menu.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover"
          loading={prioritizeImage ? "eager" : "lazy"}
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
  );
}
