"use client";

import { usePageAnalytics } from "~/hooks/useAnalytics";

/**
 * Site-wide analytics tracking component
 * This gets added to the root layout to track all page views
 */
export function RootAnalytics() {
  // Track page views site-wide
  usePageAnalytics();

  // This component doesn't render anything visible
  return null;
}
