import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.material === item.material &&
              i.finish === item.finish &&
              !item.designDataUrl,
          );
          if (existing && !item.designDataUrl) {
            const quantity = existing.quantity + item.quantity;
            return {
              items: s.items.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      quantity,
                      lineTotal: Math.round((existing.unitPrice * quantity)),
                    }
                  : i,
              ),
            };
          }
          return { items: [item, ...s.items] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, quantity, lineTotal: Math.round(i.unitPrice * quantity) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "omnibrand.cart" },
  ),
);
