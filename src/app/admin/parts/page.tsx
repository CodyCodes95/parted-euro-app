"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getPartColumns, type Part } from "./_components/columns";
import { PartForm } from "./_components/part-form";
import { DeletePartDialog } from "./_components/delete-part-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function PartsAdminPage() {
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [isEditPartOpen, setIsEditPartOpen] = useState(false);
  const [isDeletePartOpen, setIsDeletePartOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch all parts
  const { data, isLoading } = api.part.getAll.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by part number, name, or alternate part numbers
        </p>
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
          searchKey="name"
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
