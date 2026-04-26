import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variantName?: string) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantName?: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, variantName) => {
        const existing = get().items.find(
          (i) => i.product.id === product.id && i.variantName === variantName
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === product.id && i.variantName === variantName
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { product, quantity, variantName, unitPrice: product.price }],
          }));
        }
      },
      removeItem: (productId, variantName) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.variantName === variantName)
          ),
        })),
      updateQuantity: (productId, quantity, variantName) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.variantName === variantName
              ? { ...i, quantity }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);