"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

export type OrderMode = "dine-in" | "advance";
export type OrderPaymentMethod = "cash" | "card" | "qris";

export type MockOrderReceipt = {
  code: string;
  quantities: Record<string, number>;
  orderMode: OrderMode;
  tableLabel: string | null;
  paymentMethod: OrderPaymentMethod;
};

type NewMockOrder = Omit<MockOrderReceipt, "code">;

type OrderCartContextValue = {
  quantities: Record<string, number>;
  changeQuantity: (menuId: string, delta: number) => void;
  latestMockOrder: MockOrderReceipt | null;
  confirmMockOrder: (order: NewMockOrder) => void;
};

const OrderCartContext = createContext<OrderCartContextValue | null>(null);

export function OrderCartProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [latestMockOrder, setLatestMockOrder] =
    useState<MockOrderReceipt | null>(null);
  const nextMockOrderNumber = useRef(1);

  function changeQuantity(menuId: string, delta: number) {
    setQuantities((current) => {
      const nextQuantity = Math.max(0, (current[menuId] ?? 0) + delta);
      if (nextQuantity === 0) {
        const remaining = { ...current };
        delete remaining[menuId];
        return remaining;
      }

      return { ...current, [menuId]: nextQuantity };
    });
  }

  function confirmMockOrder(order: NewMockOrder) {
    const code = `HT-DEMO-${String(nextMockOrderNumber.current).padStart(4, "0")}`;
    nextMockOrderNumber.current += 1;
    setLatestMockOrder({
      ...order,
      code,
      quantities: { ...order.quantities },
    });
    setQuantities({});
  }

  return (
    <OrderCartContext.Provider
      value={{ quantities, changeQuantity, latestMockOrder, confirmMockOrder }}
    >
      {children}
    </OrderCartContext.Provider>
  );
}

export function useOrderCart() {
  const context = useContext(OrderCartContext);
  if (!context) {
    throw new Error("useOrderCart must be used inside an OrderCartProvider");
  }
  return context;
}
