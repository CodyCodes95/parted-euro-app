import { useEffect } from "react";
import { trackListingView } from "~/lib/analytics";

interface ListingViewTrackerProps {
  listingId: string;
}

/**
 * Component to track listing views
 * Usage: Include this component in listing detail pages
 */
export function ListingViewTracker({ listingId }: ListingViewTrackerProps) {
  useEffect(() => {
    // Don't track during development to avoid skewing analytics
    if (process.env.NODE_ENV === "development") return;

    // Track the listing view
    trackListingView(listingId);
  }, [listingId]);

  // This component doesn't render anything
  return null;
}
