// src/app/shared/components/sidebar/sidebar.ts
import { Component, signal, inject, Output, EventEmitter, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../../features/auth/auth-service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, MatRippleModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = toSignal(this.authService.user$, { initialValue: this.authService.currentUser });

  navItems: NavItem[] = [
    { label: 'Overview', icon: 'dashboard', route: '/dashboard', exact: true },
    { label: 'Policies', icon: 'policy', route: '/dashboard/policies' },
    { label: 'Claim', icon: 'assignment', route: '/dashboard/claim' },
  ];

  getInitial(): string {
    return this.currentUser()?.name?.charAt(0)?.toUpperCase() ?? '?';
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  closeMobile(): void {
    this.mobileOpenChange.emit(false);
  }

  onNavClick(): void {
    // Close mobile sidebar on navigation
    if (this.mobileOpen) {
      this.closeMobile();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });

  }
}

