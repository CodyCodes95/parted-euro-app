import { type Metadata } from "next";
import { api } from "~/trpc/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { id } = await params;

  // fetch data
  const listing = await api.listings.getListingMetadata({ id });

  return {
    title: listing?.title,
    description: listing?.description,
    openGraph: {
      images: [listing?.images[0]?.url ?? ""],
    },
  };
}

export default function ListingPage({}) {
  return <div>ListingPage</div>;
}
