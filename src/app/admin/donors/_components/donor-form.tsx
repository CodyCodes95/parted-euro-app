"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { type DonorWithCar } from "./columns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn, formatDate } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";

// Define the form schema
const donorFormSchema = z.object({
  vin: z.string().min(1, "VIN is required"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  carId: z.string().min(1, "Car is required"),
  year: z.coerce.number().int().min(1900, "Year must be after 1900"),
  mileage: z.coerce.number().int().min(0, "Mileage must be a positive number"),
  imageUrl: z.string().optional(),
  hideFromSearch: z.boolean().default(false),
  dateInStock: z.date().optional().nullable(),
});

type DonorFormValues = z.infer<typeof donorFormSchema>;

interface DonorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: DonorWithCar;
  isEditing?: boolean;
}

export function DonorForm({
  open,
  onOpenChange,
  defaultValues,
  isEditing = false,
}: DonorFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [carOpen, setCarOpen] = useState(false);

  // Set up the form with default values
  const form = useForm<DonorFormValues>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: defaultValues
      ? {
          vin: defaultValues.vin,
          cost: defaultValues.cost,
          carId: defaultValues.carId,
          year: defaultValues.year,
          mileage: defaultValues.mileage,
          imageUrl: defaultValues.imageUrl ?? "",
          hideFromSearch: defaultValues.hideFromSearch,
          dateInStock: defaultValues.dateInStock,
        }
      : {
          vin: "",
          cost: 0,
          carId: "",
          year: new Date().getFullYear(),
          mileage: 0,
          imageUrl: "",
          hideFromSearch: false,
          dateInStock: null,
        },
  });

  // Fetch car options for the select input
  const carOptionsQuery = api.donor.getAllCars.useQuery();
  const carOptions = carOptionsQuery.data ?? [];

  // TRPC mutations for creating and updating donors
  const utils = api.useUtils();
  const createDonor = api.donor.create.useMutation({
    onSuccess: () => {
      void utils.donor.getAll.invalidate();
      toast.success("Donor added successfully");
      form.reset();
      onOpenChange(false);
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`Error adding donor: ${error.message}`);
      setIsSaving(false);
    },
  });

  const updateDonor = api.donor.update.useMutation({
    onSuccess: () => {
      void utils.donor.getAll.invalidate();
      toast.success("Donor updated successfully");
      onOpenChange(false);
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`Error updating donor: ${error.message}`);
      setIsSaving(false);
    },
  });

  // Helper function to get the car label from its ID
  const getCarLabel = (carId: string) => {
    const car = carOptions.find((c) => c.value === carId);
    return car?.label ?? "";
  };

  // Form submission handler
  function onSubmit(data: DonorFormValues) {
    setIsSaving(true);

    if (isEditing && defaultValues) {
      // Update existing donor
      updateDonor.mutate({
        vin: defaultValues.vin,
        data: data,
      });
    } else {
      // Create new donor
      createDonor.mutate(data);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Donor" : "Add New Donor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this donor&apos;s information"
              : "Add a new donor to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6 py-4"
          >
            {/* VIN Field - only editable when creating a new donor */}
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter VIN number"
                      {...field}
                      disabled={isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Car Selection with Command */}
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Car</FormLabel>
                  <Popover open={carOpen} onOpenChange={setCarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={carOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? getCarLabel(field.value)
                            : "Select a car..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search cars..." />
                        <CommandEmpty>No car found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {(carOptions ?? []).map((car) => (
                            <CommandItem
                              key={car.value}
                              value={car.label}
                              onSelect={() => {
                                form.setValue("carId", car.value);
                                setCarOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  car.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {car.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Year Field */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2010"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mileage Field */}
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost Field */}
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="5000.00"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date In Stock Field */}
            <FormField
              control={form.control}
              name="dateInStock"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date In Stock</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            formatDate(field.value)
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL Field */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hide From Search Field */}
            <FormField
              control={form.control}
              name="hideFromSearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Hide from search</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This donor won&apos;t appear in searches if checked.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Donor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
