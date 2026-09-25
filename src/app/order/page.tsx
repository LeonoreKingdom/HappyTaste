import type { Metadata } from "next";

import { OrderHome } from "@/components/order/order-home";
import { mockMenus } from "@/data/mock-menu";
import { getMockTableById } from "@/data/mock-tables";
import { createMemberReturnPath, requireMemberPage } from "@/lib/member-page-guard";

export const metadata: Metadata = {
  title: "Pesan Makanan - HappyTaste Resto",
  description: "Pilih cara pesan dan susun pesanan HappyTaste dari menu favoritmu.",
};

type OrderPageProps = {
  searchParams: Promise<{ mode?: string | string[]; table?: string | string[] }>;
};

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = await searchParams;
  const { mode, table } = params;

  if (mode === "advance") {
    await requireMemberPage(createMemberReturnPath("/order", params));
  }

  const initialTable = typeof table === "string" ? getMockTableById(table) ?? null : null;
  const initialMode = initialTable
    ? "dine-in"
    : mode === "dine-in" || mode === "advance"
      ? mode
      : null;

  return (
    <OrderHome menus={mockMenus} initialMode={initialMode} initialTable={initialTable} />
  );
}
