import { type Metadata } from "next";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "~/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { AddToCart } from "./add-to-cart";
import { CompatibleCars } from "./compatible-cars";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { id } = params;

  // fetch data
  const listing = await api.listings.getListingMetadata({ id });

  if (!listing) {
    return {
      title: "Listing Not Found",
      description: "The requested listing could not be found.",
    };
  }

  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      images: [listing?.images[0]?.url ?? ""],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = params;
  const listing = await api.listings.getListing({ id });

  if (!listing) {
    notFound();
  }

  const { title, description, price, condition, images, parts } = listing;
  const firstPart = parts?.[0];
  const quantity = firstPart?.quantity ?? 0;
  const inStock = quantity > 0;

  // This will be used client-side
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image carousel */}
        <div className="relative overflow-hidden rounded-lg bg-background">
          {images && images.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image) => (
                  <CarouselItem key={image.id}>
                    <div className="relative aspect-square h-full w-full">
                      <Image
                        src={image.url}
                        alt={title ?? ""}
                        fill
                        className="object-cover"
                        priority={images[0] === image}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </div>
            </Carousel>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-muted">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>

          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {condition}
            </Badge>
            {inStock ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                In Stock ({quantity})
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700">
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="mt-4 text-2xl font-bold text-primary">
            {formatCurrency(price ?? 0)}
          </div>

          <Separator className="my-4" />

          <div className="prose prose-sm max-w-none">
            <p>{description}</p>
          </div>

          {/* {firstPart?.donor && (
            <div className="mt-6 rounded-lg bg-muted p-4">
              <h3 className="font-semibold">Donor Vehicle Information</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">VIN:</span>{" "}
                  {firstPart.donor.vin}
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>{" "}
                  {firstPart.donor.year}
                </div>
                <div>
                  <span className="text-muted-foreground">Car:</span>{" "}
                  {firstPart.donor.car.make}
                </div>
                <div>
                  <span className="text-muted-foreground">Mileage:</span>{" "}
                  {firstPart.donor.mileage} km
                </div>
              </div>
            </div>
          )} */}

          {/* {firstPart?.partDetails && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <h3 className="font-semibold">Part Details</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {firstPart.partDetails.name && (
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {firstPart.partDetails.name}
                  </div>
                )}
                {firstPart.partDetails.partNo && (
                  <div>
                    <span className="text-muted-foreground">Part No:</span>{" "}
                    {firstPart.partDetails.partNo}
                  </div>
                )}
                {firstPart.partDetails.alternatePartNumbers && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      Alternate Part Numbers:
                    </span>{" "}
                    {firstPart.partDetails.alternatePartNumbers}
                  </div>
                )}
                <div className="col-span-2 mt-2">
                  <span className="text-muted-foreground">Dimensions:</span>
                  {firstPart.partDetails.length && (
                    <span> L: {firstPart.partDetails.length}mm</span>
                  )}
                  {firstPart.partDetails.width && (
                    <span> W: {firstPart.partDetails.width}mm</span>
                  )}
                  {firstPart.partDetails.height && (
                    <span> H: {firstPart.partDetails.height}mm</span>
                  )}
                  {firstPart.partDetails.weight && (
                    <span> Weight: {firstPart.partDetails.weight}kg</span>
                  )}
                </div>
                {firstPart.partDetails.cars &&
                  firstPart.partDetails.cars.length > 0 && (
                    <div className="col-span-2 mt-2">
                      <span className="text-muted-foreground">
                        Compatible with:
                      </span>
                      <CompatibleCars cars={firstPart.partDetails.cars} />
                    </div>
                  )}
              </div>
            </div>
          )} */}

          <div className="mt-6">
            {/* Client-side Add to Cart component */}
            <AddToCart
              listingId={id}
              listingTitle={title ?? ""}
              listingPrice={price ?? 0}
              listingImage={images?.[0]?.url}
              quantity={quantity}
              dimensions={{
                length: firstPart?.partDetails?.length ?? null,
                width: firstPart?.partDetails?.width ?? null,
                height: firstPart?.partDetails?.height ?? null,
                weight: firstPart?.partDetails?.weight ?? null,
              }}
              vin={firstPart?.donor?.vin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
