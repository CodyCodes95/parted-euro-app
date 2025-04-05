"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const pathname = usePathname();
  const trackEventMutation = api.analytics.trackEvent.useMutation();
  
  // Generate session ID
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('analytics_session_id', sessionId);
    }
    
    return sessionId;
  }, []);
  
  // Track any analytics event
  const trackEvent = useCallback((eventData: {
    eventType: string;
    path?: string;
    listingId?: string;
    metadata?: Record<string, unknown>;
  }) => {
    // Don't track in development
    if (process.env.NODE_ENV === 'development') return;
    
    const sessionId = getSessionId();
    
    trackEventMutation.mutate({
      ...eventData,
      sessionId,
      userAgent: navigator.userAgent,
    });
  }, [getSessionId, trackEventMutation]);
  
  // Track page visit
  const trackPageView = useCallback(() => {
    trackEvent({
      eventType: 'pageView',
      path: pathname,
      metadata: {
        referrer: document.referrer,
      },
    });
  }, [trackEvent, pathname]);
  
  // Track listing view
  const trackListingView = useCallback((listingId: string) => {
    trackEvent({
      eventType: 'listingView',
      listingId,
    });
  }, [trackEvent]);
  
  // Add additional tracking methods as needed
  // e.g. trackAddToCart, trackCheckout, etc.
  
  return {
    trackEvent,
    trackPageView,
    trackListingView,
  };
} 