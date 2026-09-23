import { menuCategories as frontendCategories, mockMenus } from "@/data/mock-menu";
import { mockBanners, mockPromos } from "@/data/mock-promos";
import { mockTables } from "@/data/mock-tables";
import { mockLocationContactInfo } from "@/data/mock-location-contact";
import { mockReservationOutlets } from "@/data/mock-reservations";
import { db } from "./index";
import { banners, menuCategories, menus, outlets, promos, restaurantTables } from "./schema";

const categoryIds = {
  "Makanan Utama": "makanan-utama",
  Camilan: "camilan",
  Minuman: "minuman",
} as const;

const categoryRows = frontendCategories.map((name) => ({
  id: categoryIds[name],
  name,
}));

const menuRows = mockMenus.map((menu) => ({
  id: menu.id,
  name: menu.name,
  description: menu.description,
  price: menu.price,
  categoryId: categoryIds[menu.category],
  imageUrl: menu.image,
  ingredients: menu.ingredients,
  portion: menu.portion,
}));

const promoRows = [
  ...mockPromos.map((promo) => ({
    id: promo.id,
    title: promo.title,
    description: promo.description,
    type: promo.type,
    value: promo.value,
    terms: promo.terms,
    startDate: new Date(`${promo.startDate}T00:00:00.000Z`),
    endDate: new Date(`${promo.endDate}T23:59:59.999Z`),
    isActive: promo.isActive,
  })),
  {
    id: "promo-seed-inactive",
    title: "Promo Nonaktif (Fixture Seed)",
    description: "Fixture deterministik untuk smoke test filter promo publik.",
    type: "discount",
    value: 0,
    terms: "Fixture pengembangan; tidak ditampilkan pada API publik.",
    startDate: new Date("2026-09-01T00:00:00.000Z"),
    endDate: new Date("2099-12-31T23:59:59.999Z"),
    isActive: false,
  },
];

const bannerRows = mockBanners.map((banner) => ({
  id: banner.id,
  title: banner.title,
  imageUrl: banner.imageUrl,
  link: banner.link,
  sortOrder: banner.order,
  isActive: banner.isActive,
  promoId: banner.promoId,
}));

const tableRows = mockTables.map((table, index) => ({
  id: table.id,
  outletId: "happy-taste-demo",
  tableNumber: table.label.replace("Meja ", ""),
  capacity: index === 2 ? 6 : 4,
  type: index === 2 ? ("vip" as const) : ("regular" as const),
  qrCode: table.qrValue,
  status: "available" as const,
}));

const outletRows = mockReservationOutlets.map((outlet) => ({
  id: outlet.id,
  name: outlet.name,
  address: outlet.address,
  phone: mockLocationContactInfo.contactChannels.find((channel) => channel.id === "phone")?.value,
  whatsapp: mockLocationContactInfo.contactChannels.find((channel) => channel.id === "whatsapp")?.value,
  email: mockLocationContactInfo.contactChannels.find((channel) => channel.id === "email")?.value,
  openingHours: mockLocationContactInfo.operatingHours,
  facilities: [...mockLocationContactInfo.facilities],
  latitude: outlet.latitude,
  longitude: outlet.longitude,
  isDemoLocation: outlet.isDemoLocation,
  isActive: true,
}));

db.transaction((tx) => {
  tx.insert(menuCategories).values(categoryRows).onConflictDoNothing().run();
  tx.insert(menus).values(menuRows).onConflictDoNothing().run();
  tx.insert(promos).values(promoRows).onConflictDoNothing().run();
  tx.insert(banners).values(bannerRows).onConflictDoNothing().run();
  tx.insert(restaurantTables).values(tableRows).onConflictDoNothing().run();
  tx.insert(outlets).values(outletRows).onConflictDoNothing().run();
});

console.log(
  `Seed siap: ${categoryRows.length} kategori, ${menuRows.length} menu, ${promoRows.length} promo, ${bannerRows.length} banner, ${tableRows.length} meja, ${outletRows.length} outlet.`,
);
