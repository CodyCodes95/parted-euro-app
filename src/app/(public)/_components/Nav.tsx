import { SearchIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import { MobileNav } from "./mobile-nav";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CartDrawer } from "~/components/cart-drawer";
import CartButton from "./cart-button";
import AdminMenu from "./admin-menu";

const Nav = () => {
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <SearchIcon className="h-5 w-5" />
          </Button>
          <CartButton />
          <Suspense fallback={null}>
            <AdminMenu />
          </Suspense>
          <MobileNav />
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
};

export default Nav;
