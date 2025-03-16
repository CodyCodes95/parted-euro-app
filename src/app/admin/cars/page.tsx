"use client";

import { useState } from "react";
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

  // Ignore TypeScript errors for now - will be fixed when proper types are set up
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const { data } = api.car.getAll.useQuery({ limit: 100 });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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

  const columns = getCarColumns({
    onEdit: handleEditCar,
    onDelete: handleDeleteCar,
  });

  return (
    <div className="container p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cars Management</h1>
      </div>

      <DataTable
        columns={columns}
        data={cars}
        searchKey="make"
        filterableColumns={[
          {
            id: "body",
            title: "Body Type",
            options: [
              { label: "Sedan", value: "Sedan" },
              { label: "Coupe", value: "Coupe" },
              { label: "Wagon", value: "Wagon" },
              { label: "Convertible", value: "Convertible" },
              { label: "SUV", value: "SUV" },
            ],
          },
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
