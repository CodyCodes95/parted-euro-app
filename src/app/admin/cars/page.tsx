"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getCarColumns, type Car } from "~/components/cars/columns";
import { CarForm } from "~/components/cars/car-form";
import { DeleteCarDialog } from "~/components/cars/delete-car-dialog";
import { keepPreviousData } from "@tanstack/react-query";

export default function CarsAdminPage() {
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isDeleteCarOpen, setIsDeleteCarOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string | undefined>(
    undefined,
  );

  // Fetch all unique series for the filter
  const { data: seriesOptions = [] } = api.car.getAllSeries.useQuery();

  // Fetch cars with pagination, search, and series filter
  const { data, isLoading, isError } = api.car.getAll.useQuery(
    {
      limit: 100,
      search: searchTerm,
      series: seriesFilter,
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const cars = data?.items ?? [];

  const handleAddCar = () => {
    setIsAddCarOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
    setIsEditCarOpen(true);
  };

  const handleDeleteCar = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteCarOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const columns = getCarColumns({
    onEdit: handleEditCar,
    onDelete: handleDeleteCar,
  });

  return (
    <div className="container p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cars Management</h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search cars..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by make, model, series, or generation
        </p>
      </div>

      <div className="mb-4">
        <select
          className="h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
          value={seriesFilter ?? ""}
          onChange={(e) => setSeriesFilter(e.target.value || undefined)}
        >
          <option value="">All Series</option>
          {seriesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={cars} onAddClick={handleAddCar} />

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
