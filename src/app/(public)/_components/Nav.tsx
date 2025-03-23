"use client";
import { SearchIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MobileNav } from "./mobile-nav";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CartDrawer } from "~/components/cart-drawer";
import { useCartStore } from "~/stores/useCartStore";

const Nav = () => {
  const { toggleCart, cart } = useCartStore();
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-background py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Parted Euro"
            width={150}
            height={40}
            className="h-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden space-x-8 md:flex">
          <Link
            href="/browse"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            Browse Store
          </Link>
          <Link
            href="/wrecking"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            Cars Wrecking Now
          </Link>
          <Link
            href="/warranty"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            Warranty & Return Policy
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            Contact
          </Link>
        </nav>

        {/* Icons and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <button
            aria-label="Search"
            className="hidden text-muted-foreground transition-colors hover:text-primary md:flex"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
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
          <Link
            href="/account"
            aria-label="User Account"
            className="hidden text-muted-foreground transition-colors hover:text-primary md:flex"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <MobileNav />
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
};

export default Nav;
