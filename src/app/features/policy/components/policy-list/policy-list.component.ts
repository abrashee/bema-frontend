// src/app/features/policy/components/policy-list/policy-list.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PolicyService } from '../../policy-service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Policy } from '../../../../shared/models';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatDialogModule, CurrencyPipe, DatePipe],
  templateUrl: './policy-list.component.html',
  styleUrl: './policy-list.component.scss',
})
export class PolicyListComponent implements OnInit {
  private policyService = inject(PolicyService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  policies = signal<Policy[]>([]);
  isLoading = signal(true);
  deletingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading.set(true);
    this.policyService.getAllPolicies().subscribe({
      next: (res) => {
        if (res.data) this.policies.set(res.data);
        else this.notification.error(res.message || 'Failed to load policies');
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load policies');
        this.isLoading.set(false);
      },
    });
  }

  editPolicy(id: number): void {
    this.router.navigate(['/dashboard/policies', id, 'edit']);
  }

  confirmDelete(policy: Policy): void {
    const confirmed = window.confirm(
      `Delete "${policy.type}" policy (#${policy.id})? This cannot be undone.`
    );
    if (confirmed) this.deletePolicy(policy.id);
  }

  deletePolicy(id: number): void {
    this.deletingId.set(id);
    this.policyService.deletePolicy(id).subscribe({
      next: () => {
        this.policies.update((list) => list.filter((p) => p.id !== id));
        this.notification.success('Policy deleted successfully');
        this.deletingId.set(null);
      },
      error: () => {
        this.notification.error('Failed to delete policy');
        this.deletingId.set(null);
      },
    });
  }

  getBadgeClass(type: Policy['type']): string {
    return `badge badge-${type.toLowerCase()}`;
  }

  getPolicyIcon(type: Policy['type']): string {
    return {
      CAR: 'directions_car',
      HEALTH: 'favorite',
      LIFE: 'health_and_safety',
      HOME: 'home',
      TRAVEL: 'flight',
      PET: 'pets',
      GADGET: 'devices',
      BUSINESS: 'work',
      RENTAL: 'apartment',
      CYBER: 'security',
    }[type];
  }

  isActive(policy: Policy): boolean {
    return new Date(policy.endDate) >= new Date();
  }
}
