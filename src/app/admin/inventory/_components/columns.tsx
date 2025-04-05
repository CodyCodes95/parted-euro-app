"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { type InventoryItem } from "../page";

interface InventoryColumnsProps {
  onEdit: (inventory: InventoryItem) => void;
  onDelete: (inventory: InventoryItem) => void;
}

export function getInventoryColumns({
  onEdit,
  onDelete,
}: InventoryColumnsProps): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: "partDetails.name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Part Name
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "partDetails.partNo",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Part Number
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "inventoryLocation.name",
      header: "Location",
      cell: ({ row }) => row.original.inventoryLocation?.name ?? "Not assigned",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Quantity
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        );
      },
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
      accessorKey: "listed",
      header: "Listed",
      cell: ({ row }) => {
        const isListed =
          row.original.listing && row.original.listing.length > 0;
        return (
          <Badge variant={isListed ? "default" : "outline"}>
            {isListed ? "Yes" : "No"}
          </Badge>
        );
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
