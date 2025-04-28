"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { formatCurrency } from "~/lib/formatters";
import { type AdminOrdersItem } from "~/trpc/shared";

const formSchema = z.object({
  status: z.string().min(1, {
    message: "Status is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AdminOrdersItem;
  onSuccess: () => void;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<FormData> = {
    status: order.status || "",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const updateOrderMutation = api.orders.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      let successMessage = "Order status updated successfully";

      if (variables.status === "Ready for pickup") {
        successMessage =
          "Order status updated and pickup notification email sent";
      } else if (variables.status === "SHIPPED") {
        successMessage =
          "Order status updated and shipping notification email sent";
      }

      toast.success(successMessage);
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Error updating order status: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    updateOrderMutation.mutate({
      orderId: order.id,
      status: data.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status for order {order.id}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="Ready for pickup">
                        Ready for pickup
                      </SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
