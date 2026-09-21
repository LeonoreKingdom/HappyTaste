"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type OrderCartContextValue = {
  quantities: Record<string, number>;
  changeQuantity: (menuId: string, delta: number) => void;
};

const OrderCartContext = createContext<OrderCartContextValue | null>(null);

export function OrderCartProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

  return (
    <OrderCartContext.Provider value={{ quantities, changeQuantity }}>
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
