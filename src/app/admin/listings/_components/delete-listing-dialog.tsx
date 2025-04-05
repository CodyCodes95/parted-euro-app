"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { type ListingItem } from "../page";

interface DeleteListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingItem;
}

export function DeleteListingDialog({
  open,
  onOpenChange,
  listing,
}: DeleteListingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();

  const deleteMutation = api.listings.delete.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted successfully");
      onOpenChange(false);
      void utils.listings.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting listing: ${error.message}`);
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate({ id: listing.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the listing "{listing.title}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
