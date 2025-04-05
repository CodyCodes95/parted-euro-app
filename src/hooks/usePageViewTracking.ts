"use client";

import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";

/**
 * Hook to track page views
 * Usage: Just call this hook at the top level of any page component
 */
export function usePageViewTracking() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);
}
