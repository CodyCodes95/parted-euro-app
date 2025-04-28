"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table/data-table";
import { getOrderColumns } from "./_components/columns";
import { keepPreviousData } from "@tanstack/react-query";
import { AddTrackingDialog } from "./_components/add-tracking-dialog";
import { OrderDetailsDialog } from "./_components/order-details-dialog";
import { UpdateStatusDialog } from "./_components/update-status-dialog";
import { type AdminOrdersItem } from "~/trpc/shared";
import { toast } from "sonner";

export default function OrdersAdminPage() {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrdersItem | null>(
    null,
  );
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isAddTrackingOpen, setIsAddTrackingOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);

  // Fetch all orders
  const ordersQuery = api.orders?.getAllAdmin.useQuery(undefined, {
    placeholderData: keepPreviousData,
  });

  const updateStatusMutation = api.orders?.updateStatus.useMutation();

  const orders = ordersQuery?.data?.items ?? [];
  const isLoading = ordersQuery?.isLoading ?? true;

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
            toast.success("Order status updated and notification email sent");
          },
        },
      );
    }
  };

  const handleCompleteOrder = (order: AdminOrdersItem) => {
    if (order.id) {
      updateStatusMutation.mutate(
        {
          orderId: order.id,
          status: "Completed",
        },
        {
          onSuccess: () => {
            void ordersQuery?.refetch?.();
            toast.success("Order marked as completed");
          },
        },
      );
    }
  };

  const handleCancelOrder = (order: AdminOrdersItem) => {
    if (order.id) {
      updateStatusMutation.mutate(
        {
          orderId: order.id,
          status: "Cancelled",
        },
        {
          onSuccess: () => {
            void ordersQuery?.refetch?.();
            toast.success("Order cancelled");
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
    onCompleteOrder: handleCompleteOrder,
    onCancelOrder: handleCancelOrder,
  });

  return (
    <div className="max-w-full p-6">
      <h1 className="mb-6 text-3xl font-bold">Orders Management</h1>

      {isLoading && (
        <div className="flex h-20 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {!isLoading && <DataTable columns={columns} data={orders} />}

      {selectedOrder && (
        <>
          <OrderDetailsDialog
            open={isOrderDetailsOpen}
            onOpenChange={(open) => {
              setIsOrderDetailsOpen(open);
              if (!open) setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
          <AddTrackingDialog
            open={isAddTrackingOpen}
            onOpenChange={(open) => {
              setIsAddTrackingOpen(open);
              if (!open) setSelectedOrder(null);
            }}
            order={selectedOrder}
            onSuccess={() => void ordersQuery?.refetch?.()}
          />
          <UpdateStatusDialog
            open={isUpdateStatusOpen}
            onOpenChange={(open) => {
              setIsUpdateStatusOpen(open);
              if (!open) setSelectedOrder(null);
            }}
            order={selectedOrder}
            onSuccess={() => void ordersQuery?.refetch?.()}
          />
        </>
      )}
    </div>
  );
}
