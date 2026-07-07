// src/app/features/policy/policy-routing.ts
import { Routes } from '@angular/router';

export const policyRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/policy-list/policy-list.component').then((m) => m.PolicyListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/policy-form/policy-form.component').then((m) => m.PolicyFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/policy-form/policy-form.component').then((m) => m.PolicyFormComponent),
  },
];
