import type { Metadata } from "next";

import { OrderHome } from "@/components/order/order-home";
import { mockMenus } from "@/data/mock-menu";

export const metadata: Metadata = {
  title: "Pesan Makanan - HappyTaste Resto",
  description: "Pilih cara pesan dan susun pesanan HappyTaste dari menu favoritmu.",
};

export default function OrderPage() {
  return <OrderHome menus={mockMenus} />;
}
