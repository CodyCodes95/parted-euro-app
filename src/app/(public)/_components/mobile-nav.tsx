"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronRight,
  Home,
  CarFront,
  Shield,
  PhoneCall,
} from "lucide-react";
import { cn } from "~/lib/utils";

const navLinks = [
  { href: "/browse", label: "Browse Store", icon: Home },
  { href: "/wrecking", label: "Cars Wrecking Now", icon: CarFront },
  { href: "/warranty", label: "Warranty & Return Policy", icon: Shield },
  { href: "/contact", label: "Contact", icon: PhoneCall },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Reset active index when closing
    if (isOpen) setActiveIndex(-1);
  };

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 p-2 text-primary transition-all duration-300 hover:bg-primary/20"
      >
        <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
        <span
          className={cn(
            "absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300",
            isOpen ? "translate-y-0 rotate-45" : "-translate-y-1",
          )}
        />
        <span
          className={cn(
            "absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300",
            isOpen ? "opacity-0" : "opacity-100",
          )}
        />
        <span
          className={cn(
            "absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 rounded-full bg-current transition-all duration-300",
            isOpen ? "translate-y-0 -rotate-45" : "translate-y-1",
          )}
        />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={toggleMenu}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-full max-w-xs transform overflow-y-auto bg-background p-6 shadow-xl transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-foreground">Menu</p>
            <button
              onClick={toggleMenu}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav className="mt-8 flex-1">
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <li key={link.href} className="overflow-hidden">
                  <Link
                    href={link.href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg border border-transparent p-3 text-base font-medium transition-all duration-200",
                      "hover:border-primary/20 hover:bg-primary/5",
                      activeIndex === index
                        ? "bg-primary/10 text-primary"
                        : "text-foreground",
                    )}
                    onClick={() => {
                      setActiveIndex(index);
                      toggleMenu();
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                  >
                    <span className="flex items-center gap-3">
                      <link.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-300",
                          activeIndex === index
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                      <span>{link.label}</span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-all duration-300",
                        activeIndex === index
                          ? "translate-x-0 text-primary"
                          : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-6">
            <p className="text-center text-sm text-muted-foreground">
              BMW Spare Parts Specialists
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
