export function trackLyticsEvent(payload: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const jstag = (window as any).jstag;

  if (!jstag?.send) {
    console.warn('[Lytics] JSTag not available', payload);
    return;
  }

  jstag.send(payload);
}