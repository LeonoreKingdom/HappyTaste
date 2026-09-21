import type { ReactNode } from "react";

import { OrderCartProvider } from "@/components/order/order-cart-provider";

export default function OrderLayout({ children }: { children: ReactNode }) {
  return <OrderCartProvider>{children}</OrderCartProvider>;
}
