"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type Car = {
  id: string;
  make: string;
  series: string;
  generation: string;
  model: string;
  body: string | null;
};

interface CarColumnsProps {
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export function getCarColumns({
  onEdit,
  onDelete,
}: CarColumnsProps): ColumnDef<Car>[] {
  return [
    {
      accessorKey: "make",
      header: "Make",
    },
    {
      accessorKey: "series",
      header: "Series",
    },
    {
      accessorKey: "generation",
      header: "Generation",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "body",
      header: "Body",
      cell: ({ row }) => {
        const body = row.original.body;
        return <div>{body || "-"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const car = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(car)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(car)}
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
