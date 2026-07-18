import { Component, Injector, OnInit, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  change?: string;
  changeDir?: 'up' | 'down';
}

interface RecentActivity {
  icon: string;
  message: string;
  time: string;
  type: 'policy' | 'claim' | 'system';
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-home">
      <div class="page-header">
        <div>
          <h1 class="page-title">Overview</h1>
          <p class="page-subtitle">Welcome back! Here's what's happening.</p>
        </div>
        <div class="page-header-actions">
          <a routerLink="/dashboard/policies/new" mat-flat-button class="btn-gradient">
            <mat-icon>add</mat-icon>
            New Policy
          </a>
          <a routerLink="/dashboard/claim/new" mat-stroked-button class="btn-outline-gradient">
            <mat-icon>assignment_add</mat-icon>
            File Claim
          </a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        @for (stat of statCards(); track stat.label) {
          <div class="stat-card glass">
            <div class="stat-card-header">
              <span class="stat-label">{{ stat.label }}</span>
              <div class="stat-icon" [style.background]="stat.gradient">
                <mat-icon>{{ stat.icon }}</mat-icon>
              </div>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            @if (stat.change) {
              <div class="stat-change" [class.up]="stat.changeDir === 'up'" [class.down]="stat.changeDir === 'down'">
                <mat-icon>{{ stat.changeDir === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ stat.change }}
              </div>
            }
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="quick-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="quick-actions">
          <a routerLink="/dashboard/policies" class="quick-card glass glass-hover">
            <div class="quick-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
              <mat-icon>policy</mat-icon>
            </div>
            <div>
              <div class="quick-title">Manage Policies</div>
              <div class="quick-desc">View and manage all your insurance policies</div>
            </div>
            <mat-icon class="quick-arrow">arrow_forward</mat-icon>
          </a>
          <a routerLink="/dashboard/claim" class="quick-card glass glass-hover">
            <div class="quick-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
              <mat-icon>assignment</mat-icon>
            </div>
            <div>
              <div class="quick-title">Track Claims</div>
              <div class="quick-desc">Monitor real-time claim status and history</div>
            </div>
            <mat-icon class="quick-arrow">arrow_forward</mat-icon>
          </a>
          <a routerLink="/dashboard/claim/new" class="quick-card glass glass-hover">
            <div class="quick-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7)">
              <mat-icon>add_circle</mat-icon>
            </div>
            <div>
              <div class="quick-title">File New Claim</div>
              <div class="quick-desc">Submit a new insurance claim quickly</div>
            </div>
            <mat-icon class="quick-arrow">arrow_forward</mat-icon>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      animation: fadeInUp 0.5s ease both;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }

    .page-header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      padding: 20px;
    }

    .stat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        color: white;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      &.up {
        color: #43e97b;
      }

      &.down {
        color: #f5576c;
      }
    }

    .quick-section {
      margin-top: 8px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quick-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.25s;

      &:hover .quick-arrow {
        transform: translateX(4px);
        color: #a78bfa;
      }
    }

    .quick-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);

      mat-icon {
        color: white;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .quick-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .quick-desc {
      font-size: 13px;
      color: var(--text-muted);
    }

    .quick-arrow {
      margin-left: auto;
      color: var(--text-muted);
      transition: all 0.2s;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .page-header {
        flex-direction: column;
      }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class DashboardHomeComponent implements OnInit {
  private injector = inject(Injector);

  statCards = signal<StatCard[]>([
    {
      label: 'Total Policies',
      value: '—',
      icon: 'policy',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      change: 'Loading...',
    },
    {
      label: 'Total Claims',
      value: '—',
      icon: 'assignment',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    },
    {
      label: 'Approved Claims',
      value: '—',
      icon: 'verified',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    },
    {
      label: 'Pending Review',
      value: '—',
      icon: 'schedule',
      gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
    },
  ]);

  async ngOnInit(): Promise<void> {
    const [{ PolicyService }, { ClaimService }] = await Promise.all([
      import('../policy/policy-service'),
      import('../claim/claim-service'),
    ]);

    const policyService = this.injector.get(PolicyService);
    const claimService = this.injector.get(ClaimService);

    policyService.getAllPolicies().subscribe({
      next: (res) => {
        if (res.data) {
          this.statCards.update((cards) =>
            cards.map((c, i) => (i === 0 ? { ...c, value: res.data.length, change: undefined } : c))
          );
        }
      },
      error: () => {
        this.statCards.update((cards) =>
          cards.map((c, i) => (i === 0 ? { ...c, value: 'N/A', change: undefined } : c))
        );
      },
    });

    claimService.getAllClaims().subscribe({
      next: (res) => {
        if (res.data) {
          const claims = res.data;
          const approved = claims.filter((c) => c.status === 'APPROVED').length;
          const pending = claims.filter(
            (c) => c.status === 'PENDING' || c.status === 'PROCESSING'
          ).length;
          this.statCards.update((cards) =>
            cards.map((c, i) => {
              if (i === 1) return { ...c, value: claims.length };
              if (i === 2) return { ...c, value: approved };
              if (i === 3) return { ...c, value: pending };
              return c;
            })
          );
        }
      },
      error: () => {
        this.statCards.update((cards) =>
          cards.map((c, i) => (i >= 1 ? { ...c, value: 'N/A' } : c))
        );
      },
    });
  }
}
