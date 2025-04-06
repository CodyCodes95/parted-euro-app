"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Truck,
  Package,
  MoreVertical,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { type AdminOrdersItem } from "~/trpc/shared";
import { formatDistanceToNow } from "date-fns";
import { CreditCard, FileText, SendHorizontal, Tag } from "lucide-react";

// Format currency
const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

const formatPrice = (price: number) => formatter.format(price);

// Get badge variant based on order status
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "secondary";
    case "paid":
      return "default";
    case "processing":
      return "default";
    case "shipped":
      return "success";
    case "ready for pickup":
      return "success";
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

interface OrderColumnsProps {
  onViewDetails: (order: AdminOrdersItem) => void;
  onAddTracking: (order: AdminOrdersItem) => void;
  onReadyForPickup: (order: AdminOrdersItem) => void;
  onUpdateStatus: (order: AdminOrdersItem) => void;
}

/**
 * Returns the columns for the orders data table
 */
export function getOrderColumns({
  onViewDetails,
  onAddTracking,
  onReadyForPickup,
  onUpdateStatus,
}: OrderColumnsProps): ColumnDef<AdminOrdersItem>[] {
  return [
    {
      accessorKey: "xeroInvoiceRef",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.xeroInvoiceId}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Date
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
          {row.original.phoneNumber && (
            <span className="text-xs text-muted-foreground">
              {row.original.phoneNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusBadge(status)}>{status || "Unknown"}</Badge>
        );
      },
    },
    {
      accessorKey: "shippingMethod",
      header: "Shipping",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.shippingMethod ?? ""}</span>
          {row.original.shipping > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatPrice(row.original.shipping)}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "shippingAddress",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.original.shippingAddress || "Not specified"}
        </div>
      ),
    },
    {
      accessorKey: "trackingNumber",
      header: "Tracking",
      cell: ({ row }) => {
        const tracking = row.original.trackingNumber;
        const carrier = row.original.carrier;

        if (!tracking) {
          return <span className="text-xs text-muted-foreground">None</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs">{tracking}</span>
            {carrier && (
              <span className="text-xs text-muted-foreground">{carrier}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "subtotal",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Total
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const subtotal = row.original.subtotal;
        const shipping = row.original.shipping || 0;
        const total = subtotal + shipping;
        return formatPrice(total);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(order)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onAddTracking(order)}>
                <Truck className="mr-2 h-4 w-4" />
                Add Tracking
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onReadyForPickup(order)}>
                <Package className="mr-2 h-4 w-4" />
                Ready for Pickup
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoreVertical className="mr-2 h-4 w-4" />
                  Update Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
                    <Check className="mr-2 h-4 w-4" />
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
