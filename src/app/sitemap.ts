import { api } from "~/trpc/server";

export default async function Sitemap() {
  const listings = await api.listings.getSitemapListings();
  return listings.map((listing) => ({
    url: `https://partedeuro.com.au/listings/${listing.id}`,
    lastModified: listing.updatedAt,
  }));
}
