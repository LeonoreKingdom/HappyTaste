import type { Metadata } from "next";

import { OrderStatusScreen } from "@/components/order/order-status-screen";
import { mockMenus } from "@/data/mock-menu";

export const metadata: Metadata = {
  title: "Status Pesanan - HappyTaste Resto",
  description: "Lihat status simulasi dan ringkasan pesanan HappyTaste.",
};

export default function OrderStatusPage() {
  return <OrderStatusScreen menus={mockMenus} />;
}
