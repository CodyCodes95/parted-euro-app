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
import { Checkbox } from "~/components/ui/checkbox";

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

const formatPrice = (price: number) => formatter.format(price);

// Function to calculate quantity based on parts
const calculateQty = (listing: AdminListingsItem) => {
  // Group parts by partDetailsId and sum their quantities
  const groupedParts = listing.parts.reduce(
    (acc, part) => {
      const partDetailsId = part.partDetails.partNo;
      if (!acc[partDetailsId]) {
        acc[partDetailsId] = 0;
      }
      // Now we can use the actual quantity field from the part
      acc[partDetailsId] += part.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Find the maximum sum of quantities for any part number
  const maxQuantity =
    Object.values(groupedParts).length > 0
      ? Math.max(...Object.values(groupedParts))
      : 0;
  return maxQuantity;
};

interface ListingColumnsProps {
  onEdit: (listing: AdminListingsItem) => void;
  onDelete: (listing: AdminListingsItem) => void;
  onListOnEbay: (listing: AdminListingsItem) => void;
}

export function getListingColumns({
  onEdit,
  onDelete,
  onListOnEbay,
}: ListingColumnsProps): ColumnDef<AdminListingsItem>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <Link href={`/listings/${row.original.id}`}>
            {row.original.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "parts",
      header: "Part Numbers",
      accessorFn: (row) => {
        return row.parts.map((part) => part.partDetails.partNo).join(", ");
      },
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
                className="w-fit font-mono text-xs"
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      accessorFn: (row) => calculateQty(row),
      cell: ({ row }) => {
        const quantity = calculateQty(row.original);
        return <span className="font-mono text-xs">{quantity}</span>;
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="eBay" />
      ),
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
      id: "variants",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Variants" />
      ),
      accessorFn: (row) => {
        const variants = Array.from(
          new Set(
            row.parts
              .map((p) => (p.variant ?? "").trim())
              .filter((v) => v.length > 0),
          ),
        );
        return variants.join(", ");
      },
      cell: ({ row }) => {
        const variants = row.getValue<string>("variants");
        return variants ? (
          <span className="text-xs">{variants}</span>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
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
