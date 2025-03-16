"use client";

import * as React from "react";
import {
  Home,
  Car,
  Package,
  Boxes,
  UserPlus,
  ShoppingCart,
  Tag,
  Map,
  FolderTree,
  Users,
  Settings2,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}) {
  const pathname = usePathname();

  // Admin navigation items
  const adminNav = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: pathname === "/admin",
    },
    {
      title: "Cars",
      url: "/admin/cars",
      icon: Car,
      isActive: pathname.startsWith("/admin/cars"),
    },
    {
      title: "Parts",
      url: "/admin/parts",
      icon: Package,
      isActive: pathname.startsWith("/admin/parts"),
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: Boxes,
      isActive: pathname.startsWith("/admin/inventory"),
    },
    {
      title: "Donors",
      url: "/admin/donors",
      icon: UserPlus,
      isActive: pathname.startsWith("/admin/donors"),
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingCart,
      isActive: pathname.startsWith("/admin/orders"),
    },
    {
      title: "Listings",
      url: "/admin/listings",
      icon: Tag,
      isActive: pathname.startsWith("/admin/listings"),
    },
    {
      title: "Inventory Locations",
      url: "/admin/locations",
      icon: Map,
      isActive: pathname.startsWith("/admin/locations"),
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: FolderTree,
      isActive: pathname.startsWith("/admin/categories"),
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      isActive: pathname.startsWith("/admin/users"),
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings2,
      isActive: pathname.startsWith("/admin/settings"),
    },
  ];

  // Default user data as fallback
  const userData = user || {
    name: "Admin User",
    email: "admin@partededuro.com",
    image: "/avatars/admin.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <img src="/stripes.png" alt="Logo" />
          </div>
          <span className="truncate text-left text-sm font-semibold leading-tight">
            Parted Euro Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: userData.name,
            email: userData.email,
            avatar: userData.image || "/avatars/default.jpg",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
