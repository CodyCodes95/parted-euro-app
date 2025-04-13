"use client";
import * as React from "react";
import { Button } from "~/components/ui/button";
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
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";

export type CarOption = {
  value: string;
  label: string;
  make: string;
  series: string;
  generation: string;
  model: string;
};

interface FilterableCarSelectProps {
  options: CarOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  width?: string;
  height?: string;
  maxDisplayCount?: number;
}

export function FilterableCarSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select cars",
  searchPlaceholder = "Search cars...",
  disabled = false,
  width = "100%",
  height = "450px",
  maxDisplayCount = 3,
}: FilterableCarSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(value);
  const [search, setSearch] = React.useState("");

  // Filters
  const [seriesFilter, setSeriesFilter] = React.useState<string>("all");
  const [generationFilter, setGenerationFilter] = React.useState<string>("all");
  const [modelFilter, setModelFilter] = React.useState<string>("all");

  // Extract unique filter values
  const uniqueSeries = React.useMemo(() => {
    const seriesSet = new Set<string>();
    options.forEach((option) => {
      if (option.series) seriesSet.add(option.series);
    });
    return Array.from(seriesSet).sort();
  }, [options]);

  const uniqueGenerations = React.useMemo(() => {
    const generationSet = new Set<string>();
    options.forEach((option) => {
      if (seriesFilter === "" || option.series === seriesFilter) {
        if (option.generation) generationSet.add(option.generation);
      }
    });
    return Array.from(generationSet).sort();
  }, [options, seriesFilter]);

  const uniqueModels = React.useMemo(() => {
    const modelSet = new Set<string>();
    options.forEach((option) => {
      if (
        (seriesFilter === "" || option.series === seriesFilter) &&
        (generationFilter === "" || option.generation === generationFilter)
      ) {
        if (option.model) modelSet.add(option.model);
      }
    });
    return Array.from(modelSet).sort();
  }, [options, seriesFilter, generationFilter]);

  // Filter options based on search and filters
  const filteredOptions = React.useMemo(() => {
    return options.filter((option) => {
      // Apply search filter first
      const matchesSearch =
        search === "" ||
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.value.toLowerCase().includes(search.toLowerCase());

      // Apply category filters
      const matchesSeries =
        seriesFilter === "" ||
        seriesFilter === "all" ||
        option.series === seriesFilter;
      const matchesGeneration =
        generationFilter === "" ||
        generationFilter === "all" ||
        option.generation === generationFilter;
      const matchesModel =
        modelFilter === "" ||
        modelFilter === "all" ||
        option.model === modelFilter;

      return (
        matchesSearch && matchesSeries && matchesGeneration && matchesModel
      );
    });
  }, [options, search, seriesFilter, generationFilter, modelFilter]);

  // Update internal state when external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedOptions(value);
    }
  }, [value]);

  // Handle selecting all filtered options
  const handleSelectAll = () => {
    const filteredValues = filteredOptions.map((option) => option.value);
    const newSelection = Array.from(
      new Set([...selectedOptions, ...filteredValues]),
    );
    setSelectedOptions(newSelection);
    onChange?.(newSelection);
  };

  // Handle clearing all filters
  const clearFilters = () => {
    setSeriesFilter("");
    setGenerationFilter("");
    setModelFilter("");
  };

  const handleSelectOption = (optionValue: string) => {
    setSelectedOptions((current) => {
      // Toggle selection
      const newValue = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];

      // Call the onChange handler with the new selection
      onChange?.(newValue);
      return newValue;
    });
  };

  const handleRemoveOption = (optionValue: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedOptions((current) => {
      const newValue = current.filter((v) => v !== optionValue);
      onChange?.(newValue);
      return newValue;
    });
  };

  // Get labels for selected options to display in trigger
  const selectedLabels = React.useMemo(() => {
    return selectedOptions
      .map((value) => options.find((opt) => opt.value === value)?.label ?? "")
      .filter(Boolean);
  }, [selectedOptions, options]);

  // Set up virtualization for the filtered options list
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-h-10 w-full justify-between",
            selectedOptions.length > 0 ? "h-full" : "",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
          }}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedOptions.length > 0 ? (
              <>
                {selectedLabels.slice(0, maxDisplayCount).map((label) => (
                  <Badge
                    variant="secondary"
                    key={label}
                    className="max-w-[150px] truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {label}
                    <Button
                      className="ml-1 h-4 w-4 rounded-full p-0"
                      variant="ghost"
                      onClick={(e) => {
                        const optionValue = options.find(
                          (opt) => opt.label === label,
                        )?.value;
                        if (optionValue) handleRemoveOption(optionValue, e);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {selectedOptions.length > maxDisplayCount && (
                  <Badge variant="secondary">
                    +{selectedOptions.length - maxDisplayCount} more
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width }}
        align="start"
        sideOffset={8}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <div className="border-t p-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Filters</div>
              {(seriesFilter || generationFilter || modelFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={seriesFilter}
                onValueChange={(value) => {
                  setSeriesFilter(value);
                  // Reset dependent filters when parent filter changes
                  setGenerationFilter("");
                  setModelFilter("");
                }}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {uniqueSeries.map((series) => (
                    <SelectItem key={series} value={series}>
                      {series}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={generationFilter}
                onValueChange={(value) => {
                  setGenerationFilter(value);
                  // Reset dependent filters
                  setModelFilter("");
                }}
                disabled={uniqueGenerations.length === 0}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Generation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Generations</SelectItem>
                  {uniqueGenerations.map((generation) => (
                    <SelectItem key={generation} value={generation}>
                      {generation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={modelFilter}
                onValueChange={setModelFilter}
                disabled={uniqueModels.length === 0}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {uniqueModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-t px-2 py-1">
            <div className="text-sm">
              {filteredOptions.length}{" "}
              {filteredOptions.length === 1 ? "result" : "results"}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleSelectAll}
              disabled={filteredOptions.length === 0}
            >
              Select All
            </Button>
          </div>

          <CommandList
            ref={parentRef}
            style={{
              height,
              width: "100%",
              overflow: "auto",
            }}
          >
            <CommandEmpty>No cars found.</CommandEmpty>
            <CommandGroup>
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualOptions.map((virtualRow) => {
                  const option = filteredOptions[virtualRow.index];
                  if (!option) return null;

                  const isSelected = selectedOptions.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelectOption}
                      className="absolute left-0 top-0 w-full"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="flex flex-1 items-center truncate">
                        {option.label}
                      </span>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
