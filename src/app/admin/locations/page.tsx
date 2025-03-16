"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getLocationColumns, type Location } from "./_components/columns";
import { LocationForm } from "./_components/location-form";
import { DeleteLocationDialog } from "./_components/delete-location-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";

interface LocationWithTimestamps extends Location {
  createdAt: Date;
  updatedAt: Date;
}

export default function LocationsAdminPage() {
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [isDeleteLocationOpen, setIsDeleteLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get the current sort parameters from the sorting state
  const sortConfig =
    sorting.length > 0
      ? {
          sortBy: sorting[0]?.id,
          sortOrder: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
        }
      : null;

  // Fetch locations with pagination, search, and sorting
  const locationsQuery = api.location.getAll.useQuery(
    {
      limit: 100,
      search: searchTerm,
      ...(sortConfig ?? {}),
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const locations = locationsQuery.data?.items ?? [];
  const isLoading = locationsQuery.isLoading;

  const handleAddLocation = () => {
    setIsAddLocationOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditLocationOpen(true);
  };

  const handleDeleteLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteLocationOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const columns = getLocationColumns({
    onEdit: handleEditLocation,
    onDelete: handleDeleteLocation,
  });

  return (
    <div className="container p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Locations Management</h1>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search locations..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by location name
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
          data={locations}
          onAddClick={handleAddLocation}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      )}

      <LocationForm
        open={isAddLocationOpen}
        onOpenChange={setIsAddLocationOpen}
      />

      {selectedLocation && (
        <>
          <LocationForm
            open={isEditLocationOpen}
            onOpenChange={setIsEditLocationOpen}
            defaultValues={selectedLocation}
            isEditing
          />
          <DeleteLocationDialog
            open={isDeleteLocationOpen}
            onOpenChange={setIsDeleteLocationOpen}
            location={selectedLocation}
          />
        </>
      )}
    </div>
  );
}
