"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="p-2 text-gray-700"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-50 bg-white p-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/browse"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
              onClick={toggleMenu}
            >
              Browse Store
            </Link>
            <Link
              href="/wrecking"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
              onClick={toggleMenu}
            >
              Cars Wrecking Now
            </Link>
            <Link
              href="/warranty"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
              onClick={toggleMenu}
            >
              Warranty & Return Policy
            </Link>
            <Link
              href="/contact"
              className="rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all hover:bg-blue-600 hover:text-white"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
