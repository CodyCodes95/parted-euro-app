"use client";

import { useEffect } from "react";
import { useCartStore } from "~/stores/useCartStore";

export function ClearCartOnLoad() {
  useEffect(() => {
    const { clearCart } = useCartStore.getState();
    clearCart();
  }, []);

  return null;
}
