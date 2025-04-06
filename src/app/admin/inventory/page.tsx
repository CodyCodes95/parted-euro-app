"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getInventoryColumns } from "./_components/columns";
import { InventoryForm } from "./_components/inventory-form";
import { DeleteInventoryDialog } from "./_components/delete-inventory-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { type AdminInventoryItem } from "~/trpc/shared";

export default function InventoryAdminPage() {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isEditInventoryOpen, setIsEditInventoryOpen] = useState(false);
  const [isDeleteInventoryOpen, setIsDeleteInventoryOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<AdminInventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get the current sort parameters from the sorting state
  const sortConfig =
    sorting.length > 0
      ? {
          sortBy: sorting[0]?.id.includes(".")
            ? sorting[0]?.id.replace(".", "_")
            : sorting[0]?.id,
          sortOrder: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
        }
      : null;

  // Fetch inventory with pagination, search, and sorting
  const inventoryQuery = api.inventory.getAll.useQuery(
    {
      limit: 100,
      search: searchTerm,
      ...(sortConfig ?? {}),
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const inventory = inventoryQuery.data?.items ?? [];
  const isLoading = inventoryQuery.isLoading;

  const handleAddInventory = () => {
    setIsAddInventoryOpen(true);
  };

  const handleEditInventory = (item: AdminInventoryItem) => {
    setSelectedInventory(item);
    setIsEditInventoryOpen(true);
  };

  const handleDeleteInventory = (item: AdminInventoryItem) => {
    setSelectedInventory(item);
    setIsDeleteInventoryOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const columns = getInventoryColumns({
    onEdit: handleEditInventory,
    onDelete: handleDeleteInventory,
  });

  return (
    <div className="container p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button size="sm" onMouseDown={handleAddInventory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Inventory
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by part name, number, or donor VIN..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by VIN, part name, part number, or alternate part numbers
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
          data={inventory}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      )}

      <InventoryForm
        open={isAddInventoryOpen}
        onOpenChange={setIsAddInventoryOpen}
      />

      {selectedInventory && (
        <>
          <InventoryForm
            open={isEditInventoryOpen}
            onOpenChange={setIsEditInventoryOpen}
            defaultValues={selectedInventory}
            isEditing
          />
          <DeleteInventoryDialog
            open={isDeleteInventoryOpen}
            onOpenChange={setIsDeleteInventoryOpen}
            inventory={selectedInventory}
          />
        </>
      )}
    </div>
  );
}
