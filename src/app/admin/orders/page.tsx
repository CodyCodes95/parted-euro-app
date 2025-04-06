"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getOrderColumns } from "./_components/columns";
import { keepPreviousData } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import { type SortingState } from "@tanstack/react-table";
import { AddTrackingDialog } from "./_components/add-tracking-dialog";
import { OrderDetailsDialog } from "./_components/order-details-dialog";
import { UpdateStatusDialog } from "./_components/update-status-dialog";
import { type AdminOrdersItem } from "~/trpc/shared";

export default function OrdersAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrdersItem | null>(
    null,
  );
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isAddTrackingOpen, setIsAddTrackingOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);

  // Get the current sort parameters from the sorting state
  const sortConfig =
    sorting.length > 0
      ? {
          sortBy: sorting[0]?.id.includes(".")
            ? sorting[0]?.id.replace(".", "_")
            : sorting[0]?.id,
          sortOrder: sorting[0]?.desc ? ("desc" as const) : ("asc" as const),
        }
      : null;

  // Fetch orders with pagination, search, and sorting
  const ordersQuery = api.orders?.getAllAdmin.useQuery(
    {
      limit: 100,
      search: searchTerm,
      ...(sortConfig ?? {}),
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const updateStatusMutation = api.orders?.updateStatus.useMutation();

  const orders = ordersQuery?.data?.items ?? [];
  const isLoading = ordersQuery?.isLoading ?? true;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleViewOrderDetails = (order: AdminOrdersItem) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleAddTracking = (order: AdminOrdersItem) => {
    setSelectedOrder(order);
    setIsAddTrackingOpen(true);
  };

  const handleReadyForPickup = (order: AdminOrdersItem) => {
    // Call the tRPC procedure to update the order status
    if (order.id) {
      updateStatusMutation.mutate(
        {
          orderId: order.id,
          status: "Ready for pickup",
        },
        {
          onSuccess: () => {
            // Refetch orders to update the UI
            void ordersQuery?.refetch?.();
          },
        },
      );
    }
  };

  const handleUpdateStatus = (order: AdminOrdersItem) => {
    setSelectedOrder(order);
    setIsUpdateStatusOpen(true);
  };

  const columns = getOrderColumns({
    onViewDetails: handleViewOrderDetails,
    onAddTracking: handleAddTracking,
    onReadyForPickup: handleReadyForPickup,
    onUpdateStatus: handleUpdateStatus,
  });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Orders Management</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by order ID, name, email or status..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search by order ID, name, email or status
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
          data={orders}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      )}

      {selectedOrder && (
        <>
          <OrderDetailsDialog
            open={isOrderDetailsOpen}
            onOpenChange={setIsOrderDetailsOpen}
            order={selectedOrder}
          />
          <AddTrackingDialog
            open={isAddTrackingOpen}
            onOpenChange={setIsAddTrackingOpen}
            order={selectedOrder}
            onSuccess={() => void ordersQuery?.refetch?.()}
          />
          <UpdateStatusDialog
            open={isUpdateStatusOpen}
            onOpenChange={setIsUpdateStatusOpen}
            order={selectedOrder}
            onSuccess={() => void ordersQuery?.refetch?.()}
          />
        </>
      )}
    </div>
  );
}
