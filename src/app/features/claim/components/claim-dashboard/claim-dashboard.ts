// src/app/features/claim/components/claim-dashboard/claim-dashboard.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-claim-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet />`,
})
export class ClaimDashboardComponent {}