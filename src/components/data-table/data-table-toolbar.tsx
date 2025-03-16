"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  filterableColumns?: {
    id: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
  onAddClick?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  filterableColumns = [],
  onAddClick,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder="Search..."
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-9 w-full md:w-[250px]"
          />
        )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id) && (
                <div key={column.id} className="flex items-center space-x-2">
                  <Select
                    value={
                      (table
                        .getColumn(column.id)
                        ?.getFilterValue() as string) ?? ""
                    }
                    onValueChange={(value) =>
                      table.getColumn(column.id)?.setFilterValue(value)
                    }
                  >
                    <SelectTrigger className="h-9 w-[200px]">
                      <SelectValue placeholder={`Filter by ${column.title}`} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {column.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
          )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {onAddClick && (
        <Button size="sm" className="h-9" onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Car
        </Button>
      )}
    </div>
  );
}
