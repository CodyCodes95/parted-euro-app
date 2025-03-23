"use client";
import { ShoppingCartIcon } from "lucide-react";
import React from "react";
import { useCartStore } from "~/stores/useCartStore";

const CartButton = () => {
  const { toggleCart, cart } = useCartStore();
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  return (
    <button
      onClick={toggleCart}
      aria-label="Shopping Cart"
      className="relative hidden text-muted-foreground transition-colors hover:text-primary md:flex"
    >
      <ShoppingCartIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;
