"use client";

import { type ColumnDef, type Column } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Copy,
  Tag,
  Filter,
  Check,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { type AdminInventoryItem } from "~/trpc/shared";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface InventoryColumnsProps {
  onEdit: (inventory: AdminInventoryItem) => void;
  onDelete: (inventory: AdminInventoryItem) => void;
  onDuplicate: (inventory: AdminInventoryItem) => void;
  onCreateListing?: (inventory: AdminInventoryItem) => void;
}

// Status filter component that replaces the normal column header
interface StatusFilterProps {
  column: Column<AdminInventoryItem, unknown>;
}

function StatusFilter({ column }: StatusFilterProps) {
  const [open, setOpen] = useState(false);

  // Get current filter value (default to null, not showing all statuses by default)
  const filterValue = column.getFilterValue() as string[] | undefined;

  // Status options with color mapping
  const statusOptions = [
    { value: "Listed", color: "bg-green-500" },
    { value: "Draft", color: "bg-amber-500" },
    { value: "Unlisted", color: "bg-slate-500" },
  ];

  const handleFilterChange = (status: string) => {
    // If no filters currently set, start with this one
    if (!filterValue) {
      column.setFilterValue([status]);
      return;
    }

    // If status is already in filter, remove it, otherwise add it
    const updatedFilters = filterValue.includes(status)
      ? filterValue.filter((item) => item !== status)
      : [...filterValue, status];

    // Apply the filter, or clear it if empty
    column.setFilterValue(updatedFilters.length ? updatedFilters : null);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="-ml-3 flex h-8 items-center gap-1 pl-1"
        >
          <div className="flex items-center gap-1.5">
            <Filter
              className={cn(
                "h-4 w-4",
                filterValue && filterValue.length > 0 ? "text-primary" : "",
              )}
            />
            <span>Status</span>
          </div>
          {filterValue && filterValue.length > 0 && (
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {filterValue.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {statusOptions.map((status) => (
          <DropdownMenuCheckboxItem
            key={status.value}
            checked={filterValue?.includes(status.value) ?? false}
            onCheckedChange={() => handleFilterChange(status.value)}
            className="capitalize"
          >
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", status.color)} />
              {status.value}
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getInventoryColumns({
  onEdit,
  onDelete,
  onDuplicate,
  onCreateListing,
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
      accessorKey: "partDetails.alternatePartNumbers",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alt. Part Numbers" />
      ),
      accessorFn: (row) => {
        const altPartNumbers = row.partDetails?.alternatePartNumbers;
        if (Array.isArray(altPartNumbers)) {
          return altPartNumbers.join(", ");
        }
        return altPartNumbers ?? "";
      },
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return value ?? "";
      },
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor VIN" />
      ),
      cell: ({ row }) => row.original.donorVin ?? "",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date added" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <StatusFilter column={column} />,
      enableColumnFilter: true,
      accessorFn: (row) => {
        const hasListing = row.listing?.length > 0;

        const isDraft =
          !row.donorVin || !row.partDetailsId || !row.partDetails?.cars.length;

        if (hasListing) {
          return "Listed";
        }

        if (isDraft) {
          return "Draft";
        }

        return "Unlisted";
      },
      filterFn: (row, id, filterValue: string[]) => {
        // If no filter is applied, show all rows
        if (!filterValue?.length) return true;

        // Get the row's status value and ensure it's a string
        const status = row.getValue<string>(id);

        // Show the row if its status is included in the filter values
        return filterValue.includes(status);
      },
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <Badge
            className={cn(
              status === "Listed" && "bg-green-500 hover:bg-green-500/80",
              status === "Draft" && "bg-amber-500 hover:bg-amber-500/80",
              status === "Unlisted" && "bg-slate-500 hover:bg-slate-500/80",
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inventory = row.original;
        // Determine status directly instead of using getValue which caused the linter error
        const hasListing = inventory.listing?.length > 0;
        const isDraft =
          !inventory.donorVin ||
          !inventory.partDetailsId ||
          !inventory.partDetails?.cars.length;
        const isUnlisted = !hasListing && !isDraft;

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
              {isUnlisted && onCreateListing && (
                <DropdownMenuItem onClick={() => onCreateListing(inventory)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Create listing
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
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
