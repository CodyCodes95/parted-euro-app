"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCartStore } from "~/stores/useCartStore";

/**
 * Provides client-side only rendering for the cart store
 * to prevent hydration errors with localStorage
 */
export function CartStoreInitializer({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete before rendering children
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Force a rerender on the client to ensure the cart data is properly loaded
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
