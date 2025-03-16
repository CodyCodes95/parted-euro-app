"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Part Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Weight
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("weight");
      return `${value} kg`;
    },
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
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
