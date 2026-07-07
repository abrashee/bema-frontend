type WebVitalMetric = {
  name: 'LCP' | 'CLS' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
};

function ratingFor(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  if (name === 'LCP') {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  if (name === 'CLS') {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  if (value <= 200) return 'good';
  if (value <= 500) return 'needs-improvement';
  return 'poor';
}

function report(metric: Omit<WebVitalMetric, 'rating'>): void {
  const fullMetric: WebVitalMetric = {
    ...metric,
    rating: ratingFor(metric.name, metric.value),
  };

  console.info('[web-vital]', fullMetric);
}

export function registerWebVitals(): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        report({ name: 'LCP', value: lastEntry.startTime });
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Browser does not support LCP observation.
  }

  try {
    let cls = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as PerformanceEntry[]) {
        const layoutShift = entry as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
        };

        if (!layoutShift.hadRecentInput && typeof layoutShift.value === 'number') {
          cls += layoutShift.value;
          report({ name: 'CLS', value: cls });
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Browser does not support CLS observation.
  }

  try {
    const inpObserver = new PerformanceObserver((entryList) => {
      let worstInteraction = 0;

      for (const entry of entryList.getEntries() as PerformanceEntry[]) {
        const eventTiming = entry as PerformanceEntry & {
          duration?: number;
          interactionId?: number;
        };

        if (eventTiming.interactionId && typeof eventTiming.duration === 'number') {
          worstInteraction = Math.max(worstInteraction, eventTiming.duration);
        }
      }

      if (worstInteraction > 0) {
        report({ name: 'INP', value: worstInteraction });
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
  } catch {
    // Browser does not support Event Timing observation.
  }
}
