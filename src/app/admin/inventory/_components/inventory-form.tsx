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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { type AdminInventoryItem } from "~/trpc/shared";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: AdminInventoryItem;
  isEditing?: boolean;
}

// Combined schema for part and inventory
const formSchema = z
  .object({
    // Inventory fields
    id: z.string().optional(),
    donorVin: z.string().optional().nullable(),
    inventoryLocationId: z.string().optional().nullable(),
    variant: z.string().optional().nullable(),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),

    // Part fields
    partDetailsId: z.string().min(1, "Part is required"),
    isNewPart: z.boolean().default(false),
    partNo: z.string().optional(),
    alternatePartNumbers: z.string().optional(),
    name: z.string().optional(),
    weight: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    width: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    costPrice: z.coerce.number().optional(),
    cars: z.array(z.string()).default([]),
    partTypes: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.isNewPart) {
        return (
          !!data.partNo &&
          !!data.name &&
          data.weight !== undefined &&
          data.length !== undefined &&
          data.width !== undefined &&
          data.height !== undefined
        );
      }
      return true;
    },
    {
      message: "Required fields missing for new part",
      path: ["partNo"],
    },
  );

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
  const [partSearchOpen, setPartSearchOpen] = useState(false);
  const [isNewPart, setIsNewPart] = useState(false);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [selectedPartTypes, setSelectedPartTypes] = useState<string[]>([]);
  const [carsOpen, setCarsOpen] = useState(false);
  const [partTypesOpen, setPartTypesOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<{
    id: string;
    partNo: string;
    name: string;
    data?: Record<string, unknown>;
  } | null>(null);
  const [initialPartValues, setInitialPartValues] = useState<{
    partNo: string;
    name: string;
    alternatePartNumbers?: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    costPrice?: number;
    cars: string[];
    partTypes: string[];
  } | null>(null);

  const utils = api.useUtils();

  // Fetch options for select fields
  const { data: partOptions = [] } = api.part.getAllPartDetails.useQuery();
  const { data: donorOptions = [] } = api.donor.getAllDonorsWithCars.useQuery();
  const { data: locationOptions = [] } =
    api.location.getAllLocations.useQuery();
  const { data: carOptions = [] } = api.part.getAllCars.useQuery();
  const { data: partTypeOptions = [] } = api.part.getAllPartTypes.useQuery();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: defaultValues?.id ?? undefined,
      partDetailsId: defaultValues?.partDetailsId ?? "",
      donorVin: defaultValues?.donorVin ?? null,
      inventoryLocationId: defaultValues?.inventoryLocationId ?? null,
      variant: defaultValues?.variant ?? null,
      quantity: defaultValues?.quantity ?? 1,
      isNewPart: false,
      partNo: "",
      alternatePartNumbers: "",
      name: "",
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      costPrice: 0,
      cars: [],
      partTypes: [],
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
  const createInventoryMutation = api.inventory.create.useMutation({
    onSuccess: () => {
      toast.success("Inventory item created successfully");
      onOpenChange(false);
      void utils.inventory.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating inventory item: ${error.message}`);
    },
  });

  const updateInventoryMutation = api.inventory.update.useMutation({
    onSuccess: () => {
      toast.success("Inventory item updated successfully");
      onOpenChange(false);
      void utils.inventory.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating inventory item: ${error.message}`);
    },
  });

  const createPartMutation = api.part.create.useMutation({
    onSuccess: (data) => {
      toast.success("Part created successfully");
      if (data && data.partNo) {
        form.setValue("partDetailsId", data.partNo);
        setIsNewPart(false);
        void utils.part.getAllPartDetails.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Error creating part: ${error.message}`);
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

  const updatePartMutation = api.part.update.useMutation({
    onSuccess: () => {
      toast.success("Part updated successfully");
      void utils.part.getAllPartDetails.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating part: ${error.message}`);
    },
  });

  const isSubmitting =
    form.formState.isSubmitting ||
    createInventoryMutation.isPending ||
    updateInventoryMutation.isPending ||
    createPartMutation.isPending;

  // For the part selection dropdown
  const selectedPartId = form.watch("partDetailsId");
  const selectedPartDetails = React.useMemo(() => {
    return selectedPartId
      ? partOptions.find((part) => part.value === selectedPartId)
      : null;
  }, [selectedPartId, partOptions]);

  // We need to fetch full part details when selecting a part
  // Let's use getById query instead
  const { data: partDetails } = api.part.getById.useQuery(
    { partNo: selectedPartId ?? "" },
    {
      enabled: !!selectedPartId && !isNewPart,
    },
  );

  // Modify the effect that populates part details to also save initial values
  useEffect(() => {
    if (partDetails) {
      // Always populate the form with part details, regardless of editing state
      const partNo = partDetails.partNo ?? "";
      const name = partDetails.name ?? "";
      const alternatePartNumbers = partDetails.alternatePartNumbers ?? "";
      const weight = partDetails.weight ?? 0;
      const length = partDetails.length ?? 0;
      const width = partDetails.width ?? 0;
      const height = partDetails.height ?? 0;
      const costPrice = partDetails.costPrice ?? 0;

      form.setValue("name", name);
      form.setValue("partNo", partNo);
      form.setValue("alternatePartNumbers", alternatePartNumbers);
      form.setValue("weight", weight);
      form.setValue("length", length);
      form.setValue("width", width);
      form.setValue("height", height);
      form.setValue("costPrice", costPrice);

      let carIds: string[] = [];
      if (partDetails.cars && Array.isArray(partDetails.cars)) {
        carIds = partDetails.cars.map((car) => car.id);
        form.setValue("cars", carIds);
        setSelectedCars(carIds);
      }

      let typeIds: string[] = [];
      if (partDetails.partTypes && Array.isArray(partDetails.partTypes)) {
        typeIds = partDetails.partTypes.map((type) => type.id);
        form.setValue("partTypes", typeIds);
        setSelectedPartTypes(typeIds);
      }

      // Save initial values to compare against when submitting
      setInitialPartValues({
        partNo,
        name,
        alternatePartNumbers,
        weight,
        length,
        width,
        height,
        costPrice,
        cars: carIds,
        partTypes: typeIds,
      });
    }
  }, [partDetails, form]);

  // When editing, load part details
  useEffect(() => {
    if (defaultValues && isEditing && defaultValues.partDetailsId) {
      form.setValue("partDetailsId", defaultValues.partDetailsId);
    }
  }, [defaultValues, isEditing, form]);

  // Add state for accordion open values
  const [accordionValue, setAccordionValue] = useState<string[]>([
    "inventory-info",
  ]);

  // Update accordion value when isNewPart changes
  useEffect(() => {
    if (isNewPart) {
      setAccordionValue(["part-info", "inventory-info"]);
    } else {
      setAccordionValue(["inventory-info"]);
    }
  }, [isNewPart]);

  const onSubmit = async (values: FormValues) => {
    try {
      // If it's a new part, create it first
      if (isNewPart) {
        const partData = {
          partNo: values.partNo ?? "",
          alternatePartNumbers: values.alternatePartNumbers ?? "",
          name: values.name ?? "",
          weight: values.weight ?? 0,
          length: values.length ?? 0,
          width: values.width ?? 0,
          height: values.height ?? 0,
          costPrice: values.costPrice ?? 0,
          cars: selectedCars,
          partTypes: selectedPartTypes,
        };

        await createPartMutation.mutateAsync(partData);
        // The partDetailsId will be updated in the onSuccess handler of createPartMutation
      } else {
        // Check if part details have been modified
        const hasPartChanges =
          initialPartValues &&
          (values.partNo !== initialPartValues.partNo ||
            values.name !== initialPartValues.name ||
            values.alternatePartNumbers !==
              initialPartValues.alternatePartNumbers ||
            values.weight !== initialPartValues.weight ||
            values.length !== initialPartValues.length ||
            values.width !== initialPartValues.width ||
            values.height !== initialPartValues.height ||
            values.costPrice !== initialPartValues.costPrice ||
            JSON.stringify(selectedCars) !==
              JSON.stringify(initialPartValues.cars) ||
            JSON.stringify(selectedPartTypes) !==
              JSON.stringify(initialPartValues.partTypes));

        // If part details have changed, update the part
        if (hasPartChanges && values.partDetailsId) {
          await updatePartMutation.mutateAsync({
            partNo: values.partDetailsId,
            data: {
              partNo: values.partNo ?? "",
              alternatePartNumbers: values.alternatePartNumbers ?? "",
              name: values.name ?? "",
              weight: values.weight ?? 0,
              length: values.length ?? 0,
              width: values.width ?? 0,
              height: values.height ?? 0,
              costPrice: values.costPrice ?? 0,
              cars: selectedCars,
              partTypes: selectedPartTypes,
            },
          });
        }

        // Update or create inventory item
        if (isEditing && defaultValues) {
          updateInventoryMutation.mutate({
            id: defaultValues.id,
            data: {
              partDetailsId: values.partDetailsId,
              donorVin: values.donorVin,
              inventoryLocationId: values.inventoryLocationId,
              variant: values.variant,
              quantity: values.quantity,
            },
          });
        } else {
          createInventoryMutation.mutate({
            partDetailsId: values.partDetailsId,
            donorVin: values.donorVin,
            inventoryLocationId: values.inventoryLocationId,
            variant: values.variant,
            quantity: values.quantity,
          });
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleCreateLocation = () => {
    void locationForm.handleSubmit((values) => {
      setIsCreatingLocation(true);
      createLocationMutation.mutate({ name: values.name });
    })();
  };

  const handleAddNewLocation = () => {
    locationForm.reset({ name: "" });
    setIsLocationModalOpen(true);
  };

  const handlePartSelect = (partDetailsId: string) => {
    form.setValue("partDetailsId", partDetailsId);
    form.setValue("isNewPart", false);
    setIsNewPart(false);
    setPartSearchOpen(false);
  };

  const handleCreateNewPart = () => {
    form.setValue("isNewPart", true);
    setIsNewPart(true);
    // Reset part fields
    form.setValue("partDetailsId", "");
    form.setValue("partNo", "");
    form.setValue("name", "");
    form.setValue("alternatePartNumbers", "");
    form.setValue("weight", 0);
    form.setValue("length", 0);
    form.setValue("width", 0);
    form.setValue("height", 0);
    form.setValue("costPrice", 0);
    form.setValue("cars", []);
    form.setValue("partTypes", []);
    setSelectedCars([]);
    setSelectedPartTypes([]);
    setPartSearchOpen(false);
  };

  const handleCarSelect = (value: string) => {
    setSelectedCars((current) => {
      if (current.includes(value)) {
        return current.filter((id) => id !== value);
      } else {
        return [...current, value];
      }
    });
    form.setValue(
      "cars",
      selectedCars.includes(value)
        ? selectedCars.filter((id) => id !== value)
        : [...selectedCars, value],
    );
  };

  const handlePartTypeSelect = (value: string) => {
    setSelectedPartTypes((current) => {
      if (current.includes(value)) {
        return current.filter((id) => id !== value);
      } else {
        return [...current, value];
      }
    });
    form.setValue(
      "partTypes",
      selectedPartTypes.includes(value)
        ? selectedPartTypes.filter((id) => id !== value)
        : [...selectedPartTypes, value],
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Part Selection*</FormLabel>
                <Popover open={partSearchOpen} onOpenChange={setPartSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={partSearchOpen}
                      className="w-full justify-between"
                      disabled={isEditing}
                    >
                      {isNewPart
                        ? "Create New Part"
                        : form.watch("partDetailsId")
                          ? (partOptions.find(
                              (p) => p.value === form.watch("partDetailsId"),
                            )?.label ?? "Select a part")
                          : "Select or create a part"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search parts by number or name..." />
                      <CommandEmpty>
                        <div className="p-2 text-center">
                          <p className="text-sm">No parts found</p>
                          <Button
                            onClick={handleCreateNewPart}
                            size="sm"
                            className="mt-2"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Part
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup heading="Existing Parts">
                        <CommandList className="max-h-[200px] overflow-y-auto">
                          {partOptions.map((part) => (
                            <CommandItem
                              key={part.value}
                              value={part.value}
                              onSelect={() => handlePartSelect(part.value)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.watch("partDetailsId") === part.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {part.label}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem onSelect={handleCreateNewPart}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Part
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Accordion
                type="multiple"
                value={accordionValue}
                onValueChange={setAccordionValue}
                className="w-full"
              >
                <AccordionItem value="part-info">
                  <AccordionTrigger>Part Information</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="partNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Number*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter part number"
                                {...field}
                                disabled={isEditing}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="alternatePartNumbers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alternate Part Numbers</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Comma separated alternate numbers"
                                {...field}
                                disabled={isEditing}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter part name"
                              {...field}
                              disabled={isEditing}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Weight in kg"
                                {...field}
                                disabled={isEditing}
                                min={0}
                                step={0.01}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Cost price"
                                {...field}
                                disabled={isEditing}
                                min={0}
                                step={0.01}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (cm)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Length"
                                {...field}
                                disabled={isEditing}
                                min={0}
                                step={0.1}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (cm)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Width"
                                {...field}
                                disabled={isEditing}
                                min={0}
                                step={0.1}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Height"
                                {...field}
                                disabled={isEditing}
                                min={0}
                                step={0.1}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cars"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Compatible Cars</FormLabel>
                          <Popover
                            modal={true}
                            open={carsOpen && (isNewPart || isEditing)}
                            onOpenChange={(open) =>
                              isNewPart || isEditing
                                ? setCarsOpen(open)
                                : undefined
                            }
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={carsOpen}
                                  className={cn(
                                    "justify-between",
                                    !selectedCars.length &&
                                      "text-muted-foreground",
                                  )}
                                  disabled={isEditing}
                                >
                                  {selectedCars.length > 0
                                    ? `${selectedCars.length} car${
                                        selectedCars.length > 1 ? "s" : ""
                                      } selected`
                                    : "Select cars"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                              <Command>
                                <CommandInput placeholder="Search cars..." />
                                <CommandEmpty>No car found.</CommandEmpty>
                                <CommandGroup className="relative max-h-64 overflow-y-auto">
                                  <CommandList>
                                    {carOptions.map((car) => (
                                      <CommandItem
                                        keywords={[car.label]}
                                        key={car.value}
                                        value={car.value}
                                        onSelect={() =>
                                          handleCarSelect(car.value)
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCars.includes(car.value)
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {car.label}
                                      </CommandItem>
                                    ))}
                                  </CommandList>
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {selectedCars.length > 0 && (
                            <div className="relative mt-1 flex max-h-40 flex-wrap gap-1 overflow-y-auto border p-2">
                              {selectedCars.map((id) => {
                                const car = carOptions.find(
                                  (c) => c.value === id,
                                );
                                return (
                                  car && (
                                    <Badge
                                      key={id}
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      {car.label}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => handleCarSelect(id)}
                                        disabled={isEditing}
                                      >
                                        <span className="sr-only">Remove</span>
                                        <span className="text-xs">×</span>
                                      </Button>
                                    </Badge>
                                  )
                                );
                              })}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="partTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Part Categories</FormLabel>
                          <Popover
                            modal={true}
                            open={partTypesOpen && (isNewPart || isEditing)}
                            onOpenChange={(open) =>
                              isNewPart || isEditing
                                ? setPartTypesOpen(open)
                                : undefined
                            }
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={partTypesOpen}
                                  className={cn(
                                    "justify-between",
                                    !selectedPartTypes.length &&
                                      "text-muted-foreground",
                                  )}
                                  disabled={isEditing}
                                >
                                  {selectedPartTypes.length > 0
                                    ? `${selectedPartTypes.length} categor${
                                        selectedPartTypes.length > 1
                                          ? "ies"
                                          : "y"
                                      } selected`
                                    : "Select categories"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                              <Command>
                                <CommandInput placeholder="Search categories..." />
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-y-auto">
                                  <CommandList>
                                    {partTypeOptions.map((type) => (
                                      <CommandItem
                                        keywords={[type.label]}
                                        key={type.value}
                                        value={type.value}
                                        onSelect={() =>
                                          handlePartTypeSelect(type.value)
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedPartTypes.includes(
                                              type.value,
                                            )
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {type.label}
                                      </CommandItem>
                                    ))}
                                  </CommandList>
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {selectedPartTypes.length > 0 && (
                            <div className="relative mt-1 flex flex-wrap gap-1">
                              {selectedPartTypes.map((id) => {
                                const type = partTypeOptions.find(
                                  (t) => t.value === id,
                                );
                                return (
                                  type && (
                                    <Badge
                                      key={id}
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      {type.label}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => handlePartTypeSelect(id)}
                                        disabled={isEditing}
                                      >
                                        <span className="sr-only">Remove</span>
                                        <span className="text-xs">×</span>
                                      </Button>
                                    </Badge>
                                  )
                                );
                              })}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="inventory-info">
                  <AccordionTrigger>Inventory Information</AccordionTrigger>
                  <AccordionContent className="space-y-4">
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
                                <SelectItem
                                  key={donor.value}
                                  value={donor.value}
                                >
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
                                <SelectItem value="none">
                                  Not assigned
                                </SelectItem>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

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
              onSubmit={locationForm.handleSubmit(handleCreateLocation)}
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
