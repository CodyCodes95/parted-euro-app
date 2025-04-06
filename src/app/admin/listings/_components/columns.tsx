"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { type AdminListingsItem } from "~/trpc/shared";
import { Link } from "~/components/link";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

const formatPrice = (price: number) => formatter.format(price);

interface ListingColumnsProps {
  onEdit: (listing: AdminListingsItem) => void;
  onDelete: (listing: AdminListingsItem) => void;
  onCreateOrder: (listing: AdminListingsItem) => void;
  onListOnEbay: (listing: AdminListingsItem) => void;
}

export function getListingColumns({
  onEdit,
  onDelete,
  onCreateOrder,
  onListOnEbay,
}: ListingColumnsProps): ColumnDef<AdminListingsItem>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <Link href={`/admin/listings/${row.original.id}`}>
            {row.original.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "parts",
      header: "Part Numbers",
      cell: ({ row }) => {
        const parts = row.original.parts;
        if (parts.length === 0)
          return (
            <span className="text-xs text-muted-foreground">No parts</span>
          );

        // Show up to 3 part numbers, then "... and X more"
        const displayParts = parts.slice(0, 3);
        const remainingCount = parts.length - displayParts.length;

        return (
          <div className="flex flex-col gap-1">
            {displayParts.map((part) => (
              <Badge
                key={part.id}
                variant="outline"
                className="font-mono text-xs"
              >
                {part.partDetails.partNo}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ...and {remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {formatPrice(row.original.price)}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const parts = row.original.parts;
        const totalQuantity = parts.reduce((sum, part) => sum + 1, 0);
        return totalQuantity;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Listed On" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "listedOnEbay",
      header: "eBay",
      cell: ({ row }) => {
        const isListed = row.original.listedOnEbay;
        return (
          <Badge variant={isListed ? "default" : "outline"}>
            {isListed ? "Listed" : "Not Listed"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const listing = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(listing)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onListOnEbay(listing)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                List on eBay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateOrder(listing)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(listing)}
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
