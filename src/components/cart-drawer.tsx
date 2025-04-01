"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";

import { useCartStore } from "~/stores/useCartStore";
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
import { Skeleton } from "~/components/ui/skeleton";

// Define a type for the combined cart item data
type PopulatedCartItem = {
  listingId: string;
  quantity: number;
  title?: string;
  price?: number | null;
  imageUrl?: string | null;
};

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  // Extract listing IDs from the cart
  const listingIds = useMemo(() => cart.map((item) => item.listingId), [cart]);

  // Fetch listing details using the new tRPC query
  const { data: listingsData, isLoading } =
    api.listings.getListingsByIds.useQuery(
      {
        ids: listingIds,
      },
      {
        enabled: isMounted && listingIds.length > 0, // Only run query when mounted and cart has items
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      },
    );

  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Combine cart quantities with fetched listing data
  const populatedCart = useMemo((): PopulatedCartItem[] => {
    if (!listingsData) {
      // While loading or if data is unavailable, return cart items with only ID and quantity
      return cart.map((item) => ({ ...item }));
    }

    const listingsMap = new Map(
      listingsData.map((listing) => [
        listing.id,
        {
          title: listing.title,
          price: listing.price,
          imageUrl: listing.images?.[0]?.url,
        },
      ]),
    );

    return cart.map((item) => ({
      ...item,
      ...(listingsMap.get(item.listingId) || {}),
    }));
  }, [cart, listingsData]);

  // Calculate totals using populated cart data
  const subtotal = useMemo(() => {
    return populatedCart.reduce(
      (total, item) => total + (item.price ?? 0) * item.quantity,
      0,
    );
  }, [populatedCart]);

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
            <DrawerClose className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
              <X className="h-5 w-5" />
            </DrawerClose>
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
                {isLoading && populatedCart.length > 0
                  ? // Show skeletons while loading data for existing cart items
                    populatedCart.map((item) => (
                      <CartItemSkeleton key={item.listingId} />
                    ))
                  : // Show populated items once data is loaded
                    populatedCart.map((item) => (
                      <CartItemDisplay
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
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <span className="font-medium">
                        {formatCurrency(subtotal)}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <span>{formatCurrency(subtotal)}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/checkout"
                    className="w-full"
                    onClick={closeCart}
                    aria-disabled={isLoading}
                  >
                    <Button className="w-full" disabled={isLoading}>
                      {isLoading ? "Loading..." : "Proceed to Checkout"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                    disabled={isLoading}
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

// Updated Helper component to render a cart item using PopulatedCartItem
function CartItemDisplay({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: PopulatedCartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-3">
      {/* Product image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title ?? "Listing image"}
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
            <h4 className="font-medium">{item.title ?? "Loading..."}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.price != null ? formatCurrency(item.price) : "-"}
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
            {item.price != null
              ? formatCurrency(item.price * item.quantity)
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function CartItemSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-3">
      <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}
