"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function PartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const value = pathname.includes("/inventory") ? "inventory" : "data";

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Parts Management</h1>
        <Tabs value={value} className="w-full">
          <TabsList className="mb-4">
            <Link prefetch={true} href="/admin/parts/inventory">
              <TabsTrigger value="inventory" asChild>
                <span>Inventory</span>
              </TabsTrigger>
            </Link>
            <Link prefetch={true} href="/admin/parts/data">
              <TabsTrigger value="data" asChild>
                <span>Parts</span>
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}
