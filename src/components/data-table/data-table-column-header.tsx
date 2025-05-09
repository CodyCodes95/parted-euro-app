"use client";
"use no memo";
import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      onClick={() => {
        const currentSort = column.getIsSorted();
        if (currentSort === false) {
          column.toggleSorting(false); // Sort ascending
        } else if (currentSort === "asc") {
          column.toggleSorting(true); // Sort descending
        } else {
          column.clearSorting(); // Clear sorting
        }
      }}
      className={cn("-ml-4", className)}
    >
      {title}
      {column.getIsSorted() ? (
        column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}
