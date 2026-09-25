import type { Metadata } from "next";

import { OrderCartPage } from "@/components/order/order-cart-page";
import { mockMenus } from "@/data/mock-menu";
import { getMockTableById } from "@/data/mock-tables";
import { createMemberReturnPath, requireMemberPage } from "@/lib/member-page-guard";

export const metadata: Metadata = {
  title: "Keranjang Pesanan - HappyTaste Resto",
  description: "Periksa menu dan jumlah pesanan HappyTaste sebelum melanjutkan.",
};

type CartPageProps = {
  searchParams: Promise<{ mode?: string | string[]; table?: string | string[] }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams;
  const { mode, table } = params;

  if (mode === "advance") {
    await requireMemberPage(createMemberReturnPath("/order/cart", params));
  }

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
