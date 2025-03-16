"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { type DonorWithCar } from "./columns";

interface DeleteDonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorWithCar;
}

export function DeleteDonorDialog({
  open,
  onOpenChange,
  donor,
}: DeleteDonorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // TRPC mutation for deleting a donor
  const utils = api.useUtils();
  const deleteDonor = api.donor.delete.useMutation({
    onSuccess: () => {
      void utils.donor.getAll.invalidate();
      toast.success("Donor deleted successfully");
      onOpenChange(false);
      setIsDeleting(false);
    },
    onError: (error) => {
      toast.error(`Error deleting donor: ${error.message}`);
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteDonor.mutate({ vin: donor.vin });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the donor with VIN{" "}
            <strong>{donor.vin}</strong> ({donor.year} {donor.car.make}{" "}
            {donor.car.model}). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
