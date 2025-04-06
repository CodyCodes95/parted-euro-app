import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { type Metadata } from "next";
import Image from "next/image";
import { Calendar, Gauge, Car } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { DonorPartsSearch } from "./parts-search";

type Props = {
  params: Promise<{ vin: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vin } = await params;
  const donor = await api.donor.getDonorByVin({ vin });

  if (!donor) {
    return {
      title: "Donor Vehicle Not Found",
      description: "The requested donor vehicle could not be found.",
    };
  }

  return {
    title: `${donor.year} ${donor.car.make} ${donor.car.series} ${donor.car.model} - Parts`,
    description: `Browse parts available from ${donor.year} ${donor.car.make} ${donor.car.series} ${donor.car.model} with VIN ${donor.vin}`,
    openGraph: {
      images: donor.images[0]?.url ? [donor.images[0].url] : [],
    },
  };
}

export default async function DonorPartsPage({ params }: Props) {
  const { vin } = params;
  const donor = await api.donor.getDonorByVin({ vin });

  if (!donor) {
    notFound();
  }

  // Format date for display
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Donor Vehicle Summary */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Donor Image */}
          <div className="relative h-[250px] overflow-hidden rounded-md bg-muted">
            {donor.images?.[0] ? (
              <Image
                src={donor.images[0].url}
                alt={`${donor.car.make} ${donor.car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : donor.imageUrl ? (
              <Image
                src={donor.imageUrl}
                alt={`${donor.car.make} ${donor.car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Car className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Donor Details */}
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {donor.year} {donor.car.make} {donor.car.series} {donor.car.model}
              {donor.car.body ? ` ${donor.car.body}` : ""}
            </h1>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium">VIN:</span>
                  <span className="ml-2">{donor.vin}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Gauge className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Mileage:</span>
                  <span className="ml-2">
                    {donor.mileage.toLocaleString()} km
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date In Stock:</span>
                  <span className="ml-2">{formatDate(donor.dateInStock)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium">Generation:</span>
                  <span className="ml-2">{donor.car.generation}</span>
                </div>

                {donor.car.body && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Body Type:</span>
                    <span className="ml-2">{donor.car.body}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Badge className="mt-2">
                    {donor.parts.length} parts available
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Parts Search Component (client-side) */}
      <DonorPartsSearch vin={vin} />
    </div>
  );
}
