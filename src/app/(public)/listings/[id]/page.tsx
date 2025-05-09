import { type Metadata } from "next";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { AddToCart } from "./add-to-cart";
import { InteractiveCompatibleCars } from "./interactive-compatible-cars";
import { RelatedListings } from "./related-listings";
import { ListingAnalytics } from "./listing-analytics";
import { LightboxCarousel } from "~/components/ui/lightbox-carousel";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { id } = await params;

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
  const { id } = await params;
  const listing = await api.listings.getListing({ id });

  if (!listing) {
    notFound();
  }

  const { title, description, price, images, parts } = listing;

  // Calculate total quantity by summing all parts
  const quantity =
    parts?.reduce((acc, part) => acc + (part.quantity ?? 0), 0) ?? 0;
  const inStock = quantity > 0;

  // Format images to ensure consistent structure
  const formattedImages =
    images && images.length > 0
      ? images.map((img) => ({
          id: img.id || `img-${Math.random().toString(36).substr(2, 9)}`,
          url: img.url,
          alt: title ?? "",
        }))
      : [];

  // Deduplicate parts by partNo for the first part reference
  const uniqueParts = parts?.reduce(
    (acc, part) => {
      if (
        !acc.some((p) => p.partDetails?.partNo === part.partDetails?.partNo)
      ) {
        acc.push(part);
      }
      return acc;
    },
    [] as typeof parts,
  );

  const firstPart = uniqueParts?.[0];

  // Extract all compatible cars from the parts
  const compatibleCars =
    parts?.flatMap((part) => part.partDetails?.cars || []) || [];

  // Deduplicate cars by id
  const uniqueCompatibleCars = compatibleCars.filter(
    (car, index, self) => index === self.findIndex((c) => c.id === car.id),
  );

  // Get first car's generation and model for related listings
  const firstCar = uniqueCompatibleCars[0];

  // Fetch related listings based on first car's generation and model
  const relatedListings = await api.listings.getRelatedListings({
    id,
    generation: firstCar?.generation ?? "",
    model: firstCar?.model ?? "",
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <ListingAnalytics listingId={id} />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image carousel */}
        <div className="relative overflow-hidden rounded-lg bg-background">
          {formattedImages.length > 0 ? (
            <LightboxCarousel
              images={formattedImages}
              aspectRatio="square"
              objectFit="cover"
            />
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
            {inStock ? (
              <AddToCart
                listingId={id}
                listingTitle={title ?? ""}
                listingPrice={price ?? 0}
                listingImage={formattedImages[0]?.url}
                quantity={quantity}
                dimensions={{
                  length: firstPart?.partDetails?.length ?? null,
                  width: firstPart?.partDetails?.width ?? null,
                  height: firstPart?.partDetails?.height ?? null,
                  weight: firstPart?.partDetails?.weight ?? null,
                }}
                vin={firstPart?.donor?.vin}
              />
            ) : (
              <div className="rounded-md bg-red-100 px-6 py-4 text-center text-red-700">
                This item is currently out of stock.
              </div>
            )}
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
                {uniqueParts?.map((part, index) => (
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

      {relatedListings.length > 0 && (
        <div className="mt-8">
          <RelatedListings listings={relatedListings} />
        </div>
      )}
    </div>
  );
}
