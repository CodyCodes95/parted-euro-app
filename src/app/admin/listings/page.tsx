"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getListingColumns } from "./_components/columns";
import { ListingForm } from "./_components/listing-form";
import { DeleteListingDialog } from "./_components/delete-listing-dialog";
import { keepPreviousData } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { CreateOrderDialog } from "./_components/create-order-dialog";
import { ListOnEbayDialog } from "./_components/list-on-ebay-dialog";
import { type AdminListingsItem } from "~/trpc/shared";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";

export default function ListingsAdminPage() {
  const [code, setCode] = useQueryState("code");
  const router = useRouter();
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isEditListingOpen, setIsEditListingOpen] = useState(false);
  const [isDeleteListingOpen, setIsDeleteListingOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isListOnEbayOpen, setIsListOnEbayOpen] = useState(false);
  const [selectedListing, setSelectedListing] =
    useState<AdminListingsItem | null>(null);

  // Fetch all listings
  const listingsQuery = api.listings.getAllAdmin.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

  const listings = listingsQuery.data?.items ?? [];
  const isLoading = listingsQuery.isLoading;

  const handleAddListing = () => {
    setIsAddListingOpen(true);
  };

  const handleEditListing = (item: AdminListingsItem) => {
    setSelectedListing(item);
    setIsEditListingOpen(true);
  };

  const handleDeleteListing = (item: AdminListingsItem) => {
    setSelectedListing(item);
    setIsDeleteListingOpen(true);
  };

  const handleCreateOrder = (item: AdminListingsItem) => {
    setSelectedListing(item);
    setIsCreateOrderOpen(true);
  };

  const handleListOnEbay = (item: AdminListingsItem) => {
    setSelectedListing(item);
    setIsListOnEbayOpen(true);
  };

  const columns = getListingColumns({
    onEdit: handleEditListing,
    onDelete: handleDeleteListing,
    onCreateOrder: handleCreateOrder,
    onListOnEbay: handleListOnEbay,
  });

  const updateRefreshToken = api.ebay.setTokenSet.useMutation();

  useEffect(() => {
    if (code) {
      const updateTokenRes = updateRefreshToken.mutateAsync({
        code: code,
      });

      void setCode(null);
    }
  }, [code]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Listings Management</h1>
        <Button size="sm" onMouseDown={handleAddListing}>
          <Plus className="mr-2 h-4 w-4" />
          Add Listing
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && <DataTable columns={columns} data={listings} />}

      <ListingForm open={isAddListingOpen} onOpenChange={setIsAddListingOpen} />

      {selectedListing && (
        <>
          <ListingForm
            open={isEditListingOpen}
            onOpenChange={setIsEditListingOpen}
            defaultValues={selectedListing}
            isEditing
          />
          <DeleteListingDialog
            open={isDeleteListingOpen}
            onOpenChange={setIsDeleteListingOpen}
            listing={selectedListing}
          />
          <CreateOrderDialog
            open={isCreateOrderOpen}
            onOpenChange={setIsCreateOrderOpen}
            listing={selectedListing}
          />
          <ListOnEbayDialog
            open={isListOnEbayOpen}
            onOpenChange={setIsListOnEbayOpen}
            listing={selectedListing}
          />
        </>
      )}
    </div>
  );
}
