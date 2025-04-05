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

interface ListOnEbayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingItem;
}

export function ListOnEbayDialog({
  open,
  onOpenChange,
  listing,
}: ListOnEbayDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleListOnEbay = () => {
    setIsSubmitting(true);

    // Placeholder for future implementation
    setTimeout(() => {
      toast.success(
        `Listing "${listing.title}" will be listed on eBay (placeholder)`,
      );
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>List on eBay</DialogTitle>
          <DialogDescription>
            Do you want to list "{listing.title}" on eBay?
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
            onClick={handleListOnEbay}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            List on eBay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
