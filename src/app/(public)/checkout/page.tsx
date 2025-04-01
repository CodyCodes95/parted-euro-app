"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { api } from "~/trpc/react";
import { useCartStore } from "~/stores/useCartStore";
import { formatCurrency } from "~/lib/utils";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useGoogleMapsApi } from "./_components/useGoogleMapsScript";
import {
  type CheckoutAddress,
  AddressAutoComplete,
} from "./_components/AddressAutocomplete";

// Define the form schema using zod
const checkoutFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .transform((val) => val.trim()),
    shipToCountryCode: z.string().min(1, "Country is required"),
    address: z.object({
      formattedAddress: z.string(),
      city: z.string(),
      region: z.string(),
      postalCode: z.string(),
    }),
    isB2B: z.boolean().default(false),
    acceptTerms: z
      .boolean()
      .default(false)
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),
  })
  .refine(
    (data) => {
      // If shipping to AU, address is required
      if (data.shipToCountryCode === "AU") {
        return !!data.address.formattedAddress;
      }
      return true;
    },
    {
      message: "Address is required for Australian deliveries",
      path: ["address.formattedAddress"],
    },
  );

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Type for the combined cart item data
type PopulatedCartItem = {
  listingId: string;
  quantity: number;
  title?: string;
  price?: number | null;
  imageUrl?: string | null;
};

export default function Checkout() {
  const [address, setAddress] = useState<CheckoutAddress>(
    localStorage.getItem("checkout-address")
      ? (JSON.parse(
          localStorage.getItem("checkout-address")!,
        ) as CheckoutAddress)
      : {
          formattedAddress: "",
          city: "",
          region: "",
          postalCode: "",
        },
  );

  const { isLoaded } = useGoogleMapsApi();
  const { cart, removeItem, updateQuantity } = useCartStore();

  const shippingCountries = api.checkout.getShippingCountries.useQuery();

  // Extract listing IDs from the cart
  const listingIds = useMemo(() => cart.map((item) => item.listingId), [cart]);

  // Fetch listing details using tRPC
  const { data: listingsData, isLoading } =
    api.listings.getListingsByIds.useQuery(
      {
        ids: listingIds,
      },
      {
        enabled: isLoaded && listingIds.length > 0,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      },
    );

  // Combine cart quantities with fetched listing data
  const populatedCart = useMemo((): PopulatedCartItem[] => {
    if (!listingsData) {
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
      ...(listingsMap.get(item.listingId) ?? {}),
    }));
  }, [cart, listingsData]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return populatedCart.reduce(
      (total, item) => total + (item.price ?? 0) * item.quantity,
      0,
    );
  }, [populatedCart]);

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      email: "",
      shipToCountryCode: "AU",
      address: {
        formattedAddress: "",
        city: "",
        region: "",
        postalCode: "",
      },
      isB2B: false,
      acceptTerms: false,
    },
  });

  // Update address validation when country changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "shipToCountryCode") {
        if (value.shipToCountryCode !== "AU") {
          // Reset address validation errors if country is not Australia
          form.clearErrors("address");

          // If changing from AU to another country, clear the address
          if (form.getValues("address.formattedAddress")) {
            const emptyAddress = {
              formattedAddress: "",
              city: "",
              region: "",
              postalCode: "",
            };
            setAddress(emptyAddress);
            form.setValue("address", emptyAddress);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Save address to localStorage when it changes
  useEffect(() => {
    if (address.formattedAddress) {
      localStorage.setItem("checkout-address", JSON.stringify(address));
      form.setValue("address", address);
    }
  }, [address, form]);

  // Set initial address from localStorage if available
  useEffect(() => {
    const savedAddress = localStorage.getItem("checkout-address");
    if (savedAddress) {
      try {
        const parsedAddress = JSON.parse(savedAddress) as CheckoutAddress;
        setAddress(parsedAddress);
        form.setValue("address", parsedAddress);
      } catch (error) {
        console.error("Failed to parse saved address:", error);
      }
    }
  }, []);

  // Form submission handler
  function onSubmit(data: CheckoutFormValues) {
    // Check if shipping to Australia but no address
    if (data.shipToCountryCode === "AU" && !data.address.formattedAddress) {
      form.setError("address.formattedAddress", {
        type: "manual",
        message: "Address is required for Australian deliveries",
      });
      return;
    }

    // Process checkout
    console.log("Form submitted:", data);
    // TODO: Call checkout API endpoint
    alert(
      "Checkout functionality would be implemented here. Form data: " +
        JSON.stringify(data),
    );
  }

  if (!isLoaded) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_400px]">
        {/* Cart Summary */}
        <div className="order-2 md:order-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            {cart.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                Your cart is empty.
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[350px] pr-4">
                  <div className="space-y-4">
                    {isLoading
                      ? Array.from({ length: cart.length }).map((_, i) => (
                          <CartItemSkeleton key={i} />
                        ))
                      : populatedCart.map((item) => (
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

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-muted-foreground">
                      Calculated at next step
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(subtotal)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Checkout Form */}
        <div className="order-1 md:order-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">Shipping Information</h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        We&apos;ll send your receipt to this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipToCountryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AU">AUSTRALIA</SelectItem>
                          {shippingCountries.data?.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("shipToCountryCode") === "AU" && (
                  <FormField
                    control={form.control}
                    name="address"
                    render={() => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <AddressAutoComplete
                            address={address}
                            setAddress={setAddress}
                            placeholder="Enter your Australian address"
                          />
                        </FormControl>
                        <FormDescription>
                          Start typing your suburb or postcode
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="isB2B"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>B2B Delivery</FormLabel>
                        <FormDescription>
                          This is a business address.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormDescription>
                          I agree to the terms of service and privacy policy
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={cart.length === 0}
                >
                  Continue to Payment
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart item component
function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: PopulatedCartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <div className="flex items-start gap-4 rounded-md border p-3">
      {/* Product image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-secondary">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title ?? "Product"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted" />
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{item.title ?? "Loading..."}</h4>
            <p className="text-sm text-muted-foreground">
              {item.price ? formatCurrency(item.price) : ""}
            </p>
          </div>
          <button
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity controls */}
        <div className="mt-2 flex items-center">
          <button
            className="rounded-md p-1 hover:bg-muted"
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-8 text-center">{item.quantity}</span>
          <button
            className="rounded-md p-1 hover:bg-muted"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton loading state for cart items
function CartItemSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-md border p-3">
      <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}
