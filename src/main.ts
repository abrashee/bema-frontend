import { bootstrapApplication } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerRoutePerformance } from './app/core/performance/route-performance';
import { registerWebVitals } from './app/core/performance/web-vitals';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    registerWebVitals();
    registerRoutePerformance(appRef.injector.get(Router));
  })
  .catch((err) => console.error(err));
