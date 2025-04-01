import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the simplified CartItem type
export type CartItem = {
  listingId: string;
  quantity: number;
};

interface CartState {
  cart: CartItem[];
  isOpen: boolean;

  // Actions - Note: addItem now takes the simplified item or its components
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;

  // UI actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      isOpen: false,

      // Cart item management
      addItem: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) => cartItem.listingId === item.listingId,
          );

          if (existingItem) {
            // Update quantity if item already exists
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.listingId === item.listingId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              ),
            };
          }

          // Add new item (only listingId and quantity)
          return {
            cart: [
              ...state.cart,
              { listingId: item.listingId, quantity: item.quantity },
            ],
          };
        }),

      removeItem: (listingId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.listingId !== listingId),
        })),

      // Update quantity logic remains similar, ensures quantity >= 1
      updateQuantity: (listingId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.listingId === listingId
              ? { ...item, quantity: Math.max(1, quantity) } // Ensure quantity is at least 1
              : item,
          ),
        })),

      clearCart: () => set({ cart: [] }),

      // UI actions remain the same
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "cart-storage",
      // Only store cart items in localStorage, not UI state
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
