// src/app/features/claim/claim-routing.ts
import { Routes } from '@angular/router';
import { ClaimListComponent } from './components/claim-list/claim-list.component';
import { ClaimFormComponent } from './components/claim-form/claim-form.component';

export const claimRoutes: Routes = [
  { path: '', component: ClaimListComponent },
  { path: 'new', component: ClaimFormComponent },
];