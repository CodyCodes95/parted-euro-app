"use client";

import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";

/**
 * Hook to track listing views
 * @param listingId The ID of the listing being viewed
 */
export function useListingViewTracking(listingId: string) {
  const { trackListingView } = useAnalytics();

  useEffect(() => {
    trackListingView(listingId);
  }, [listingId, trackListingView]);
}
