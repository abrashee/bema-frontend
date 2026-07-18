import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-routing').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent
          ),
      },
      {
        path: 'policies',
        loadChildren: () =>
          import('./features/policy/policy-routing').then((m) => m.policyRoutes),
      },
      {
        path: 'claim',
        loadChildren: () =>
          import('./features/claim/claim-routing').then((m) => m.claimRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];