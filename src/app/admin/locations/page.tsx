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
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

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

  // Fetch all locations
  const locationsQuery = api.location.getAll.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

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

  const columns = getLocationColumns({
    onEdit: handleEditLocation,
    onDelete: handleDeleteLocation,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Location Management</h1>
        <Button size="sm" onClick={handleAddLocation}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search locations..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          sorting={sorting}
          onSortingChange={setSorting}
          searchKey="name"
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
