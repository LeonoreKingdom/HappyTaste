import type { Metadata } from "next";

import { OrderConfirmationPage } from "@/components/order/order-confirmation-page";
import { mockMenus } from "@/data/mock-menu";
import { getMockTableById } from "@/data/mock-tables";

export const metadata: Metadata = {
  title: "Konfirmasi Pesanan - HappyTaste Resto",
  description: "Periksa pesanan dan pilih metode pembayaran simulasi HappyTaste.",
};

type ConfirmationPageProps = {
  searchParams: Promise<{ mode?: string | string[]; table?: string | string[] }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { mode, table } = await searchParams;
  const selectedTable = typeof table === "string" ? getMockTableById(table) ?? null : null;
  const orderMode = selectedTable
    ? "dine-in"
    : mode === "dine-in" || mode === "advance"
      ? mode
      : null;

  return (
    <OrderConfirmationPage
      menus={mockMenus}
      orderMode={orderMode}
      table={selectedTable}
    />
  );
}
