"use client";

import { useListingViewTracking } from "~/hooks/useAnalytics";

interface ListingAnalyticsProps {
  listingId: string;
}

/**
 * Client component that handles listing analytics
 * This is a pattern that allows us to use client-side hooks in a server component
 */
export function ListingAnalytics({ listingId }: ListingAnalyticsProps) {
  // Use our custom hook to track the listing view
  useListingViewTracking(listingId);

  // This is a "zero-impact" component that doesn't render anything visible
  return null;
}
