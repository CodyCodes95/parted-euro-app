"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { type AdminInventoryItem } from "~/trpc/shared";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";

interface InventoryColumnsProps {
  onEdit: (inventory: AdminInventoryItem) => void;
  onDelete: (inventory: AdminInventoryItem) => void;
  onDuplicate: (inventory: AdminInventoryItem) => void;
}

export function getInventoryColumns({
  onEdit,
  onDelete,
  onDuplicate,
}: InventoryColumnsProps): ColumnDef<AdminInventoryItem>[] {
  return [
    {
      accessorKey: "partDetails.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Name" />
      ),
    },
    {
      accessorKey: "partDetails.partNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part Number" />
      ),
    },
    {
      accessorKey: "inventoryLocation.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => row.original.inventoryLocation?.name ?? "Not assigned",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
    },
    {
      accessorKey: "variant",
      header: "Variant",
      cell: ({ row }) => row.original.variant ?? "",
    },
    {
      accessorKey: "donorVin",
      header: "Donor VIN",
      cell: ({ row }) => row.original.donorVin ?? "",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      accessorFn: (row) => {
        const hasListing = row.listing && row.listing.length > 0;

        // Since we can't check compatibility directly in the inventory data
        // We'll infer status based on whether it has a listing or not

        let status = "Unlisted";

        if (hasListing) {
          status = "Listed";
        } else {
          // If no listing exists, we'll show Draft status
          status = "Draft";
        }

        return status;
      },
      cell: (info) => {
        return <Badge>{info.getValue<string>()}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inventory = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(inventory)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(inventory)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(inventory)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
