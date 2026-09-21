import type { Metadata } from "next";

import { OrderHome } from "@/components/order/order-home";
import { mockMenus } from "@/data/mock-menu";

export const metadata: Metadata = {
  title: "Pesan Dulu Member - HappyTaste Resto",
  description: "Siapkan menu HappyTaste sebelum tiba di resto dengan simulasi pre-order member.",
};

export default function MemberAdvanceOrderPage() {
  return (
    <OrderHome
      menus={mockMenus}
      initialMode="advance"
      initialTable={null}
      variant="member-advance"
    />
  );
}
