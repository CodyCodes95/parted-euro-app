"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency } from "~/lib/utils";

import { useCartStore, type CartItem } from "~/stores/useCartStore";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useIsMobile } from "~/hooks/use-mobile";

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate totals
  const subtotal = cart.reduce(
    (total, item) => total + item.listingPrice * item.quantity,
    0,
  );

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Only render drawer after client-side hydration
  if (!isMounted) return null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={closeCart}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        className={isMobile ? "max-h-[85vh]" : "ml-auto h-full max-w-[400px]"}
      >
        <DrawerHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-xl font-semibold">
              <ShoppingBag className="h-5 w-5" />
              Your Cart {itemCount > 0 && `(${itemCount})`}
            </DrawerTitle>
          </div>
          <DrawerDescription>
            {cart.length === 0
              ? "Your cart is empty."
              : "Review your items before checkout."}
          </DrawerDescription>
        </DrawerHeader>

        {cart.length > 0 ? (
          <>
            <ScrollArea className="px-4 sm:px-6">
              <div className="space-y-4 py-2">
                {cart.map((item) => (
                  <CartItem
                    key={item.listingId}
                    item={item}
                    onRemove={() => removeItem(item.listingId)}
                    onUpdateQuantity={(quantity) =>
                      updateQuantity(item.listingId, quantity)
                    }
                  />
                ))}
              </div>
            </ScrollArea>

            <DrawerFooter className="px-4 sm:px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/checkout" className="w-full" onClick={closeCart}>
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          </>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-4 py-8 text-center sm:px-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add items to your cart to see them here.
              </p>
            </div>
            <Link href="/listings" onClick={closeCart}>
              <Button variant="default">Browse Products</Button>
            </Link>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

// Helper component to render a cart item
function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-3">
      {/* Product image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
        {item.listingImage ? (
          <Image
            src={item.listingImage}
            alt={item.listingTitle}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{item.listingTitle}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(item.listingPrice)}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </button>
        </div>

        {/* Quantity selector */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-l-md border-r text-sm disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </button>
            <span className="flex h-8 min-w-[2rem] items-center justify-center px-2 text-center text-sm">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-r-md border-l text-sm"
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </button>
          </div>
          <p className="ml-auto text-sm font-medium">
            {formatCurrency(item.listingPrice * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
