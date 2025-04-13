"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";

// Define the Part type based on the schema
export type Part = {
  partNo: string;
  alternatePartNumbers: string | null;
  name: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  costPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
  cars: {
    id: string;
    make: string;
    model: string;
    series: string;
    generation: string;
  }[];
  partTypes: {
    id: string;
    name: string;
  }[];
};

// Interface for column props
interface ColumnProps {
  onEdit: (part: Part) => void;
  onDelete: (part: Part) => void;
}

// Function to create and return the columns for the DataTable
export const getPartColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<Part>[] => [
  {
    accessorKey: "partNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Part Number" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "alternatePartNumbers",
    header: "Alt. Part Numbers",
    cell: ({ row }) => {
      const value = row.getValue<string | null>("alternatePartNumbers");
      return value ?? "-";
    },
  },
  {
    accessorKey: "dimensions",
    header: "Dimensions (LxWxH)",
    cell: ({ row }) => {
      const part = row.original;
      return `${part.length}x${part.width}x${part.height}`;
    },
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("weight");
      return `${value} kg`;
    },
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number | null>("costPrice");
      return value ? `$${value.toFixed(2)}` : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const part = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(part)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(part)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
