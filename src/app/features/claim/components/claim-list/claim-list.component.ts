// src/app/features/claim/components/claim-list/claim-list.component.ts
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClaimService } from '../../claim-service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Claim } from '../../../../shared/models';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, DatePipe, CurrencyPipe],
  templateUrl: './claim-list.component.html',
  styleUrl: './claim-list.component.scss',
})
export class ClaimListComponent implements OnInit, OnDestroy {
  private claimService = inject(ClaimService);
  private notification = inject(NotificationService);

  claim = signal<(Claim & { recentUpdate?: boolean })[]>([]);
  isLoading = signal(true);

  private realtimeSub?: Subscription;

  ngOnInit(): void {
    this.loadClaim();
    this.subscribeToRealtime();
  }

  loadClaim(): void {
    this.isLoading.set(true);
    this.claimService.getAllClaims().subscribe({
      next: (res) => {
        if (res.data) this.claim.set(res.data);
        else this.notification.error(res.message || 'Failed to load claims');
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load claims');
        this.isLoading.set(false);
      },
    });
  }

  private subscribeToRealtime(): void {
    this.realtimeSub = this.claimService.onClaimUpdates().subscribe((updated) => {
      this.claim.update((list) => {
        const idx = list.findIndex((c) => c.id === updated.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = { ...updated, recentUpdate: true };
          setTimeout(() => {
            this.claim.update((l) =>
              l.map((c) => (c.id === updated.id ? { ...c, recentUpdate: false } : c))
            );
          }, 8083);
          return next;
        }
        return list;
      });
      this.notification.info(`Claim #${updated.id} status updated to ${updated.status}`);
    });
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge badge-pending',
      PROCESSING: 'badge badge-processing',
      FRAUD_CHECKING: 'badge badge-fraud',
      APPROVED: 'badge badge-approved',
      REJECTED: 'badge badge-rejected',
    };
    return map[status] ?? 'badge badge-pending';
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'schedule',
      PROCESSING: 'autorenew',
      FRAUD_CHECKING: 'security',
      APPROVED: 'check_circle',
      REJECTED: 'cancel',
    };
    return map[status] ?? 'help';
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }
}
