import { SearchIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MobileNav } from "./mobile-nav";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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
        <div className="flex items-center space-x-4">
          <button
            aria-label="Search"
            className="text-muted-foreground hover:text-primary"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="text-muted-foreground hover:text-primary"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            aria-label="User Account"
            className="text-muted-foreground hover:text-primary"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Nav;
