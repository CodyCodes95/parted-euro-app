"use client";

import { useState, useMemo } from "react";
import { type Car } from "~/app/(public)/listings/[id]/compatible-cars";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

interface InteractiveCompatibleCarsProps {
  cars: Car[];
}

export function InteractiveCompatibleCars({
  cars,
}: InteractiveCompatibleCarsProps) {
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  // Group cars by series, generation, and model
  const carsBySeriesAndGeneration = useMemo(() => {
    const grouped: Record<
      string,
      {
        series: string;
        generations: Record<
          string,
          {
            generation: string;
            models: { model: string; body: string | null }[];
          }
        >;
      }
    > = {};

    cars.forEach((car) => {
      if (!grouped[car.series]) {
        grouped[car.series] = {
          series: car.series,
          generations: {},
        };
      }

      if (!grouped[car.series].generations[car.generation]) {
        grouped[car.series].generations[car.generation] = {
          generation: car.generation,
          models: [],
        };
      }

      // Check if model already exists to avoid duplicates
      const existingModelIndex = grouped[car.series].generations[
        car.generation
      ].models.findIndex((m) => m.model === car.model && m.body === car.body);

      if (existingModelIndex === -1) {
        grouped[car.series].generations[car.generation].models.push({
          model: car.model,
          body: car.body,
        });
      }
    });

    return grouped;
  }, [cars]);

  // Set initial active series if not yet set
  if (
    activeSeries === null &&
    Object.keys(carsBySeriesAndGeneration).length > 0
  ) {
    setActiveSeries(Object.keys(carsBySeriesAndGeneration)[0]);
  }

  const seriesList = Object.keys(carsBySeriesAndGeneration).sort();
  const activeSeriesData = activeSeries
    ? carsBySeriesAndGeneration[activeSeries]
    : null;

  if (!cars || cars.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Compatible Vehicles</h3>
      <div className="flex gap-4 overflow-hidden rounded-md border">
        {/* Left side - vertical series tabs */}
        <div className="min-w-36 border-r bg-muted/30">
          <div className="px-1 py-2">
            {seriesList.map((series) => (
              <button
                key={series}
                onClick={() => setActiveSeries(series)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeSeries === series
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {series}
              </button>
            ))}
          </div>
        </div>

        {/* Right side - generations and models table */}
        <div className="flex-1 p-3">
          {activeSeriesData ? (
            <div className="space-y-2">
              <div className="mb-3">
                <Badge variant="outline" className="text-xs">
                  {Object.keys(activeSeriesData.generations).length}{" "}
                  generation(s)
                </Badge>
              </div>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                        Generation
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                        Models
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.values(activeSeriesData.generations).map((gen) => (
                      <tr key={gen.generation} className="hover:bg-muted/20">
                        <td className="px-3 py-2 align-top font-medium">
                          {gen.generation}
                        </td>
                        <td className="px-3 py-2">
                          <div className="grid gap-1">
                            {gen.models.map((model, idx) => (
                              <div key={idx} className="text-sm">
                                {model.model}
                                {model.body ? ` (${model.body})` : ""}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a series to view compatible models
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
