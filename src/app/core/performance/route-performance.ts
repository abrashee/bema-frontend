import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

export function registerRoutePerformance(router: Router): void {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return;
  }

  router.events
    .pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd))
    .subscribe((event) => {
      if (event instanceof NavigationStart) {
        performance.mark(`route:${event.id}:start`);
        return;
      }

      performance.mark(`route:${event.id}:end`);
      performance.measure(
        `route:${event.urlAfterRedirects}`,
        `route:${event.id}:start`,
        `route:${event.id}:end`
      );
    });
}
