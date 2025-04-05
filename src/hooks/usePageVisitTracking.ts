import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageVisit } from "~/lib/analytics";

/**
 * Hook to track page visits
 * Usage: Just call this hook at the top level of any page component
 */
export function usePageVisitTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track during development to avoid skewing analytics
    if (process.env.NODE_ENV === "development") return;

    // Track the page visit
    trackPageVisit(pathname);
  }, [pathname]);
}
