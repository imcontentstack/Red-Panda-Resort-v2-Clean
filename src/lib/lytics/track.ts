declare global {
  interface Window {
    jstag?: {
      send?: (payload: Record<string, unknown>) => void;
    };
  }
}

export function trackLyticsEvent(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const jstag = window.jstag;

  if (!jstag?.send) {
    console.warn("[Lytics] JSTag not available", payload);
    return;
  }

  jstag.send(payload);
}