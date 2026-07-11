// src/app/shared/components/header/header.ts
import { Component, OnInit, signal, computed, inject, HostListener, DestroyRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { AuthService } from '../../../features/auth/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatRippleModule, MatDivider],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isLandingPage = signal(false);

  currentUser = toSignal(this.authService.user$, { initialValue: this.authService.currentUser });
  isAuthenticated = computed(() => this.currentUser() !== null);

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.isLandingPage.set(e.urlAfterRedirects === '/');
        this.isMobileMenuOpen.set(false);
      });
    this.isLandingPage.set(this.router.url === '/');
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  getInitial(): string {
    return this.currentUser()?.name?.charAt(0)?.toUpperCase() ?? '?';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });

  }
}

