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
import { InteractiveCompatibleCars } from "./interactive-compatible-cars";

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

  // Extract all compatible cars from the parts
  const compatibleCars =
    parts?.flatMap((part) => part.partDetails?.cars || []) || [];

  // Deduplicate cars by id
  const uniqueCompatibleCars = compatibleCars.filter(
    (car, index, self) => index === self.findIndex((c) => c.id === car.id),
  );

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
            {" "}
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
      <Separator className="my-8" />
      {parts && parts.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-semibold">Parts included</h3>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Part No
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Alternate Part Numbers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {parts.map((part, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {part.partDetails?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {part.partDetails?.partNo ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {part.partDetails?.alternatePartNumbers ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {uniqueCompatibleCars.length > 0 && (
        <div className="mt-8">
          <InteractiveCompatibleCars cars={uniqueCompatibleCars} />
        </div>
      )}

      <Separator className="my-8" />
    </div>
  );
}
