"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

// Generate session ID
const getSessionId = () => {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("analytics_session_id", sessionId);
  }

  return sessionId;
};

/**
 * Hook for tracking analytics events
 */
export const usePageAnalytics = () => {
  const pathname = usePathname();

  const trackEventMutation = api.analytics.trackEvent.useMutation();

  const trackEvent = (eventData: {
    eventType: string;
    path?: string;
    listingId?: string;
    metadata?: Record<string, unknown>;
  }) => {
    // Don't track in development
    if (process.env.NODE_ENV === "development") {
      console.log("Exiting");
      return;
    }

    const sessionId = getSessionId();

    trackEventMutation.mutate({
      ...eventData,
      sessionId,
      userAgent: navigator.userAgent,
    });
  };
  useEffect(() => {
    trackEvent({
      eventType: "pageView",
      path: pathname,
      metadata: {
        referrer: document.referrer,
      },
    });
  }, [pathname]);
  return null;
};

export const useListingViewTracking = (listingId: string) => {
  const trackEventMutation = api.analytics.trackEvent.useMutation();
  useEffect(() => {
    trackEventMutation.mutate({
      eventType: "listingView",
      listingId,
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
    });
  }, [listingId]);

  return null;
};
