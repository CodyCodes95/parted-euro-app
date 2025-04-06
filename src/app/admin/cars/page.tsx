"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getCarColumns } from "./_components/columns";
import { CarForm } from "./_components/car-form";
import { DeleteCarDialog } from "./_components/delete-car-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { type AdminCarItem } from "~/trpc/shared";

export default function CarsAdminPage() {
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isDeleteCarOpen, setIsDeleteCarOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<AdminCarItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch all cars
  const { data, isLoading, isError } = api.car.getAll.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

  const cars = data?.items ?? [];

  const handleAddCar = () => {
    setIsAddCarOpen(true);
  };

  const handleEditCar = (car: AdminCarItem) => {
    setSelectedCar(car);
    setIsEditCarOpen(true);
  };

  const handleDeleteCar = (car: AdminCarItem) => {
    setSelectedCar(car);
    setIsDeleteCarOpen(true);
  };

  const columns = getCarColumns({
    onEdit: handleEditCar,
    onDelete: handleDeleteCar,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Car Management</h1>
        <Button size="sm" onClick={handleAddCar}>
          <Plus className="mr-2 h-4 w-4" />
          Add Car
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search cars..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by make, model, series, or generation
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
          data={cars}
          sorting={sorting}
          onSortingChange={setSorting}
          searchKey="make"
        />
      )}

      <CarForm open={isAddCarOpen} onOpenChange={setIsAddCarOpen} />

      {selectedCar && (
        <>
          <CarForm
            open={isEditCarOpen}
            onOpenChange={setIsEditCarOpen}
            defaultValues={selectedCar}
            isEditing
          />
          <DeleteCarDialog
            open={isDeleteCarOpen}
            onOpenChange={setIsDeleteCarOpen}
            car={selectedCar}
          />
        </>
      )}
    </div>
  );
}
