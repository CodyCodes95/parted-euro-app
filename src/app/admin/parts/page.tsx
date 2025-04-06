"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getPartColumns, type Part } from "./_components/columns";
import { PartForm } from "./_components/part-form";
import { DeletePartDialog } from "./_components/delete-part-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function PartsAdminPage() {
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [isEditPartOpen, setIsEditPartOpen] = useState(false);
  const [isDeletePartOpen, setIsDeletePartOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [partTypeFilter, setPartTypeFilter] = useState<string | undefined>(
    undefined,
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get the current sort parameters from the sorting state
  const sortConfig =
    sorting.length > 0
      ? {
          sortBy: sorting[0]?.id,
          sortOrder: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
        }
      : null;

  // Fetch all part types for the filter
  const { data: partTypeOptions = [] } = api.part.getAllPartTypes.useQuery(
    undefined,
    {
      placeholderData: [],
    },
  );

  // Fetch parts with pagination, search, part type filter, and sorting
  const { data, isLoading } = api.part.getAll.useQuery(
    {
      limit: 100,
      search: searchTerm,
      partType: partTypeFilter,
      ...(sortConfig ?? {}),
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  // Cast the data to ensure type compatibility with the DataTable
  const parts = (data?.items ?? []) as Part[];

  const handleAddPart = () => {
    setIsAddPartOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsEditPartOpen(true);
  };

  const handleDeletePart = (part: Part) => {
    setSelectedPart(part);
    setIsDeletePartOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePartTypeChange = (value: string) => {
    // If the value is "all", set the filter to undefined to show all part types
    setPartTypeFilter(value === "all" ? undefined : value);
  };

  const columns = getPartColumns({
    onEdit: handleEditPart,
    onDelete: handleDeletePart,
  });

  return (
    <div className="max-w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Part Management</h1>
        <Button size="sm" onClick={handleAddPart}>
          <Plus className="mr-2 h-4 w-4" />
          Add Part
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search parts..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by part number, name, or alternate part numbers
        </p>
      </div>

      <div className="mb-4">
        <Select
          value={partTypeFilter ?? "all"}
          onValueChange={handlePartTypeChange}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Array.isArray(partTypeOptions) &&
              partTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && (
        <DataTable
          columns={columns}
          data={parts}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      )}

      <PartForm open={isAddPartOpen} onOpenChange={setIsAddPartOpen} />

      {selectedPart && (
        <>
          <PartForm
            open={isEditPartOpen}
            onOpenChange={setIsEditPartOpen}
            defaultValues={selectedPart}
            isEditing
          />
          <DeletePartDialog
            open={isDeletePartOpen}
            onOpenChange={setIsDeletePartOpen}
            part={selectedPart}
          />
        </>
      )}
    </div>
  );
}
