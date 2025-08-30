"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { toast } from "sonner";

type AddToCartProps = {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage?: string;
  quantity: number;
  dimensions: {
    length: number | null;
    width: number | null;
    height: number | null;
    weight: number | null;
  };
  vin?: string;
};

export function AddToCart({
  listingId,
  listingTitle,
  quantity: maxQuantity,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const utils = api.useUtils();
  const { mutateAsync: addItem } = api.cart.addItem.useMutation({
    onSuccess: async () => {
      await utils.cart.getCart.invalidate();
      await utils.cart.getCartSummary.invalidate();
    },
  });

  const handleAddToCart = async () => {
    await addItem({ listingId, quantity });
    setIsAdded(true);
    toast.success(`${listingTitle} added to cart`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (maxQuantity <= 0) {
    return (
      <div className="mt-2 rounded-md bg-red-100 px-6 py-4 text-center text-red-700">
        This item is currently out of stock.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-md border">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-l-md border-r text-sm disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-10 w-12 items-center justify-center px-2 text-center text-sm">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
            className="flex h-10 w-10 items-center justify-center rounded-r-md border-l text-sm disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{maxQuantity} available</p>
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full"
        size="lg"
        disabled={isAdded}
      >
        {isAdded ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
