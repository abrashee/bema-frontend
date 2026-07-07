// src/app/features/policy/policy-routing.ts
import { Routes } from '@angular/router';
import { PolicyListComponent } from './components/policy-list/policy-list.component';
import { PolicyFormComponent } from './components/policy-form/policy-form.component';

export const policyRoutes: Routes = [
  { path: '', component: PolicyListComponent },
  { path: 'new', component: PolicyFormComponent },
  { path: ':id/edit', component: PolicyFormComponent },
];