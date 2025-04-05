"use client";

import { useState } from "react";
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

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingItem;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  listing,
}: CreateOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrder = () => {
    setIsSubmitting(true);

    // Placeholder for future implementation
    setTimeout(() => {
      toast.success(`Order for "${listing.title}" created (placeholder)`);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Create a new order for "{listing.title}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateOrder}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
