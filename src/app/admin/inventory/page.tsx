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

  // Fetch all inventory data
  const inventoryQuery = api.inventory.getAll.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

  const inventory = inventoryQuery.data ?? [];
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

  const columns = getInventoryColumns({
    onEdit: handleEditInventory,
    onDelete: handleDeleteInventory,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button size="sm" onMouseDown={handleAddInventory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Inventory
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && <DataTable columns={columns} data={inventory} />}

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
