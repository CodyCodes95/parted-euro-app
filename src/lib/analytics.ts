import { v4 as uuidv4 } from "uuid";
import { api } from "~/trpc/client";

// Generate or retrieve a session ID
const getSessionId = (): string => {
  if (typeof window === "undefined") return "";

  // Check if we already have a session ID in localStorage
  let sessionId = localStorage.getItem("analytics_session_id");

  // If not, create a new one
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("analytics_session_id", sessionId);
  }

  return sessionId;
};

// Track a page visit
export const trackPageVisit = async (path: string) => {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();

  try {
    await api.analytics.trackPageVisit.mutate({
      path,
      sessionId,
      userAgent: navigator.userAgent,
      referer: document.referrer,
    });
  } catch (error) {
    console.error("Failed to track page visit:", error);
  }
};

// Track a listing view
export const trackListingView = async (listingId: string) => {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();

  try {
    await api.analytics.trackListingView.mutate({
      listingId,
      sessionId,
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Failed to track listing view:", error);
  }
};
