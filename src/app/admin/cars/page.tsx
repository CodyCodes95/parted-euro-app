"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getCarColumns } from "./_components/columns";
import { CarForm } from "./_components/car-form";
import { DeleteCarDialog } from "./_components/delete-car-dialog";
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
import { type AdminCarItem, type AdminCarSeriesOption } from "~/trpc/shared";

export default function CarsAdminPage() {
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isDeleteCarOpen, setIsDeleteCarOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<AdminCarItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string | undefined>(
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

  // Fetch all unique series for the filter
  const { data: seriesOptions = [] } = api.car.getAllSeries.useQuery();

  // Fetch cars with pagination, search, series filter, and sorting
  const { data, isLoading, isError } = api.car.getAll.useQuery(
    {
      limit: 100,
      search: searchTerm,
      series: seriesFilter,
      ...(sortConfig ?? {}),
    },
    {
      placeholderData: keepPreviousData,
    },
  );

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSeriesChange = (value: string) => {
    // If the value is "all", set the filter to undefined to show all series
    setSeriesFilter(value === "all" ? undefined : value);
  };

  const columns = getCarColumns({
    onEdit: handleEditCar,
    onDelete: handleDeleteCar,
  });

  return (
    <div className="container p-6">
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
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by make, model, series, or generation
        </p>
      </div>

      <div className="mb-4">
        <Select
          value={seriesFilter ?? "all"}
          onValueChange={handleSeriesChange}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select series" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Series</SelectItem>
            {seriesOptions.map((option) => (
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
          data={cars}
          sorting={sorting}
          onSortingChange={setSorting}
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
