"use client";

import { usePageViewTracking } from "~/hooks/usePageViewTracking";

/**
 * Site-wide analytics tracking component
 * This gets added to the root layout to track all page views
 */
export function RootAnalytics() {
  // Track page views site-wide
  usePageViewTracking();

  // This component doesn't render anything visible
  return null;
}
