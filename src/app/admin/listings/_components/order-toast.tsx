"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { type OrderItem } from "./bulk-order-dialog";

interface OrderToastProps {
  orderItems: OrderItem[];
  onFinalizeClick: () => void;
}

export function OrderToast({ orderItems, onFinalizeClick }: OrderToastProps) {
  const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="flex w-full items-center justify-between space-x-4">
      <div className="flex items-center space-x-2">
        <ShoppingCart className="h-4 w-4" />
        <span className="font-medium">
          {itemCount} {itemCount === 1 ? "item" : "items"} in order ($
          {totalPrice.toFixed(2)})
        </span>
      </div>
      <Button size="sm" onClick={onFinalizeClick}>
        Finalize Order
      </Button>
    </div>
  );
}
