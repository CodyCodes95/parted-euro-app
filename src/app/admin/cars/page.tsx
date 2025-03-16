"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getCarColumns, type Car } from "~/components/cars/columns";
import { CarForm } from "~/components/cars/car-form";
import { DeleteCarDialog } from "~/components/cars/delete-car-dialog";

export default function CarsAdminPage() {
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isDeleteCarOpen, setIsDeleteCarOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [generationOptions, setGenerationOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [seriesOptions, setSeriesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [modelOptions, setModelOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Ignore TypeScript errors for now - will be fixed when proper types are set up
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const { data, isLoading } = api.car.getAll.useQuery({
    limit: 1000,
    search: searchTerm,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const cars = data?.items ?? [];

  // Extract unique values for filter options
  useEffect(() => {
    if (cars && cars.length > 0) {
      // Extract unique generations
      const uniqueGenerations = Array.from(
        new Set(cars.map((car: Car) => car.generation)),
      ).map((gen) => ({ label: gen, value: gen }));

      // Extract unique series
      const uniqueSeries = Array.from(
        new Set(cars.map((car: Car) => car.series)),
      ).map((series) => ({ label: series, value: series }));

      // Extract unique models
      const uniqueModels = Array.from(
        new Set(cars.map((car: Car) => car.model)),
      ).map((model) => ({ label: model, value: model }));

      setGenerationOptions(uniqueGenerations);
      setSeriesOptions(uniqueSeries);
      setModelOptions(uniqueModels);
    }
  }, [cars]);

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

      <DataTable
        columns={columns}
        data={cars}
        filterableColumns={[
          // {
          //   id: "generation",
          //   title: "Generation",
          //   options: generationOptions,
          // },
          {
            id: "series",
            title: "Series",
            options: seriesOptions,
          },
          // {
          //   id: "model",
          //   title: "Model",
          //   options: modelOptions,
          // },
        ]}
        onAddClick={handleAddCar}
      />

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
