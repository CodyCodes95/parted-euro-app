"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getDonorColumns, type DonorWithCar } from "./_components/columns";
import { DonorForm } from "./_components/donor-form";
import { DeleteDonorDialog } from "./_components/delete-donor-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default function DonorsAdminPage() {
  const [isAddDonorOpen, setIsAddDonorOpen] = useState(false);
  const [isEditDonorOpen, setIsEditDonorOpen] = useState(false);
  const [isDeleteDonorOpen, setIsDeleteDonorOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<DonorWithCar | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch all donors
  const donorsQuery = api.donor.getAll.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

  // The donor router should already include the car relationship with 'include: { car: true }'
  const donors = donorsQuery.data?.items ?? [];
  const isLoading = donorsQuery.isLoading;

  const handleAddDonor = () => {
    setIsAddDonorOpen(true);
  };

  const handleEditDonor = (donor: DonorWithCar) => {
    setSelectedDonor(donor);
    setIsEditDonorOpen(true);
  };

  const handleDeleteDonor = (donor: DonorWithCar) => {
    setSelectedDonor(donor);
    setIsDeleteDonorOpen(true);
  };

  const columns = getDonorColumns({
    onEdit: handleEditDonor,
    onDelete: handleDeleteDonor,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Donor Management</h1>
        <Button size="sm" onClick={handleAddDonor}>
          <Plus className="mr-2 h-4 w-4" />
          Add Donor
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search donors by VIN..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by VIN number
        </p>
      </div>

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && (
        <DataTable<DonorWithCar, unknown>
          columns={columns}
          data={donors}
          sorting={sorting}
          onSortingChange={setSorting}
          searchKey="vin"
        />
      )}

      <DonorForm open={isAddDonorOpen} onOpenChange={setIsAddDonorOpen} />

      {selectedDonor && (
        <>
          <DonorForm
            open={isEditDonorOpen}
            onOpenChange={setIsEditDonorOpen}
            defaultValues={selectedDonor}
            isEditing
          />
          <DeleteDonorDialog
            open={isDeleteDonorOpen}
            onOpenChange={setIsDeleteDonorOpen}
            donor={selectedDonor}
          />
        </>
      )}
    </div>
  );
}
