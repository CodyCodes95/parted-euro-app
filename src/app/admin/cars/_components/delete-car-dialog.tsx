"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
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
import { toast } from "sonner";
import { type Car } from "./columns";

interface DeleteCarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
}

export function DeleteCarDialog({
  open,
  onOpenChange,
  car,
}: DeleteCarDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const deleteCar = api.car.delete.useMutation({
    onSuccess: () => {
      toast.success("Car deleted successfully");
      onOpenChange(false);
      // Invalidate the car queries to trigger a refetch
      utils.car.getAll.invalidate();
      utils.car.getAllSeries.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error deleting car: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (car) {
      deleteCar.mutate({ id: car.id });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the car
            record for {car?.make} {car?.series} {car?.model} from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
