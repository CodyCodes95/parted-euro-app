"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import {
  VirtualizedCombobox,
  type VirtualizedOption,
} from "~/components/ui/virtualized-combobox";
import { type AdminInventoryItem } from "~/trpc/shared";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: AdminInventoryItem;
  isEditing?: boolean;
}

const formSchema = z.object({
  id: z.string().optional(),
  partDetailsId: z.string().min(1, "Part is required"),
  donorVin: z.string().optional().nullable(),
  inventoryLocationId: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export function InventoryForm({
  open,
  onOpenChange,
  defaultValues,
  isEditing = false,
}: InventoryFormProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);

  const utils = api.useUtils();

  // Fetch options for select fields
  const { data: partOptions = [] } = api.part.getAllPartDetails.useQuery();
  const { data: donorOptions = [] } = api.donor.getAllDonorsWithCars.useQuery();
  const { data: locationOptions = [] } =
    api.location.getAllLocations.useQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id ?? undefined,
      partDetailsId: defaultValues?.partDetailsId ?? "",
      donorVin: defaultValues?.donorVin ?? null,
      inventoryLocationId: defaultValues?.inventoryLocationId ?? null,
      variant: defaultValues?.variant ?? null,
      quantity: defaultValues?.quantity ?? 1,
    },
  });

  // Create a separate form for location creation
  const locationForm = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Location name is required"),
      }),
    ),
  });

  // Mutations for create, update, and create new location
  const createMutation = api.inventory.create.useMutation({
    onSuccess: () => {
      toast.success("Inventory item created successfully");
      onOpenChange(false);
      void utils.inventory.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating inventory item: ${error.message}`);
    },
  });

  const updateMutation = api.inventory.update.useMutation({
    onSuccess: () => {
      toast.success("Inventory item updated successfully");
      onOpenChange(false);
      void utils.inventory.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating inventory item: ${error.message}`);
    },
  });

  const createLocationMutation = api.location.create.useMutation({
    onSuccess: (data) => {
      toast.success("Location created successfully");
      setIsLocationModalOpen(false);
      setNewLocationName("");
      setIsCreatingLocation(false);
      void utils.location.getAllLocations.invalidate();
      // Set the new location as the selected value
      form.setValue("inventoryLocationId", data.id);
    },
    onError: (error) => {
      toast.error(`Error creating location: ${error.message}`);
      setIsCreatingLocation(false);
    },
  });

  const isSubmitting =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (isEditing && defaultValues) {
      updateMutation.mutate({
        id: defaultValues.id,
        data: values,
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleCreateLocation = () => {
    void locationForm.handleSubmit((values) => {
      setIsCreatingLocation(true);
      createLocationMutation.mutate({ name: values.name });
    })();
  };

  // Show the create location dialog
  const handleAddNewLocation = () => {
    locationForm.reset({ name: "" });
    setIsLocationModalOpen(true);
  };

  // Convert part options to the format expected by VirtualizedCombobox
  const partOptionsFormatted = React.useMemo(
    () =>
      partOptions.map((part) => ({
        value: part.value,
        label: part.label,
      })) as VirtualizedOption[],
    [partOptions],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="partDetailsId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part*</FormLabel>
                    <FormControl>
                      <VirtualizedCombobox
                        options={partOptionsFormatted}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a part"
                        searchPlaceholder="Search parts..."
                        disabled={isEditing}
                        height="250px"
                        width="100%"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donorVin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donor Car</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a donor car (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {donorOptions.map((donor) => (
                          <SelectItem key={donor.value} value={donor.value}>
                            {donor.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inventoryLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? "none"}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a location (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {locationOptions.map((location) => (
                            <SelectItem
                              key={location.value}
                              value={location.value}
                            >
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddNewLocation}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity*</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Variant (e.g., color, size, etc.)"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create new location dialog */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Location</DialogTitle>
          </DialogHeader>
          <Form {...locationForm}>
            <form
              onSubmit={locationForm.handleSubmit((values) => {
                setIsCreatingLocation(true);
                createLocationMutation.mutate({ name: values.name });
              })}
              className="space-y-4"
            >
              <FormField
                control={locationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLocationModalOpen(false)}
                  disabled={isCreatingLocation}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingLocation}>
                  {isCreatingLocation && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
