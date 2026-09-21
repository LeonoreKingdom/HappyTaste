import type { Metadata } from "next";

import { OrderCartPage } from "@/components/order/order-cart-page";
import { mockMenus } from "@/data/mock-menu";
import { getMockTableById } from "@/data/mock-tables";

export const metadata: Metadata = {
  title: "Keranjang Pesanan - HappyTaste Resto",
  description: "Periksa menu dan jumlah pesanan HappyTaste sebelum melanjutkan.",
};

type CartPageProps = {
  searchParams: Promise<{ mode?: string | string[]; table?: string | string[] }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const { mode, table } = await searchParams;
  const selectedTable = typeof table === "string" ? getMockTableById(table) ?? null : null;
  const orderMode = selectedTable
    ? "dine-in"
    : mode === "dine-in" || mode === "advance"
      ? mode
      : null;

  return (
    <OrderCartPage menus={mockMenus} orderMode={orderMode} table={selectedTable} />
  );
}
