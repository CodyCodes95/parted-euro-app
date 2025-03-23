import { SearchIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MobileNav } from "./mobile-nav";

const Nav = () => {
  return (
    <header className="sticky top-0 z-50 bg-white py-4 shadow-sm">
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
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
          >
            Browse Store
          </Link>
          <Link
            href="/wrecking"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
          >
            Cars Wrecking Now
          </Link>
          <Link
            href="/warranty"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
          >
            Warranty & Return Policy
          </Link>
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
          >
            Contact
          </Link>
        </nav>

        {/* Icons and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <button
            aria-label="Search"
            className="text-gray-700 hover:text-blue-600"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="text-gray-700 hover:text-blue-600"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            aria-label="User Account"
            className="text-gray-700 hover:text-blue-600"
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
