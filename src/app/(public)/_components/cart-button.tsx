"use client";
import { ShoppingCartIcon } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { useCartUI } from "~/components/cart-provider";
import { api } from "~/trpc/react";

const CartButton = () => {
  const { toggle } = useCartUI();
  const { data } = api.cart.getCartSummary.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const itemCount = data?.count ?? 0;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="relative"
      aria-label="Shopping Cart"
    >
      <ShoppingCartIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartButton;
