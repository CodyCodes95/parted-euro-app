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
  const value = pathname.includes("/inventory") ? "inventory" : "parts";

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Parts Management</h1>
        <Tabs value={value} className="w-full">
          <TabsList className="mb-4">
            <Link href="/admin/parts" passHref legacyBehavior>
              <TabsTrigger value="parts" asChild>
                <a className={value === "parts" ? "data-[state=active]" : ""}>
                  Parts
                </a>
              </TabsTrigger>
            </Link>
            <Link href="/admin/parts/inventory" passHref legacyBehavior>
              <TabsTrigger value="inventory" asChild>
                <a
                  className={value === "inventory" ? "data-[state=active]" : ""}
                >
                  Inventory
                </a>
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}
