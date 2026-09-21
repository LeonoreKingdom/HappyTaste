import type { Metadata } from "next";

import { OrderHome } from "@/components/order/order-home";
import { mockMenus } from "@/data/mock-menu";
import { getMockTableById } from "@/data/mock-tables";

export const metadata: Metadata = {
  title: "Pesan Makanan - HappyTaste Resto",
  description: "Pilih cara pesan dan susun pesanan HappyTaste dari menu favoritmu.",
};

type OrderPageProps = {
  searchParams: Promise<{ table?: string | string[] }>;
};

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const { table } = await searchParams;
  const initialTable = typeof table === "string" ? getMockTableById(table) ?? null : null;

  return <OrderHome menus={mockMenus} initialTable={initialTable} />;
}
