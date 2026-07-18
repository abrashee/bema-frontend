import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { LandingHeader } from '../../shared/components/landing-header/landing-header';
import { Footer } from '../../shared/components/footer/footer';
import { AuthService } from '../auth/auth-service';

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

interface Stat {
  value: number;
  target: number;
  suffix: string;
  prefix: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, LandingHeader, Footer, DecimalPipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  private timers: ReturnType<typeof setInterval>[] = [];
  private counterStartTimer?: ReturnType<typeof setTimeout>;

  stats = signal<Stat[]>([
    { value: 0, target: 10000, suffix: '+', prefix: '', label: 'Active Policies', icon: 'policy' },
    { value: 0, target: 98, suffix: '%', prefix: '', label: 'Claims Approved', icon: 'verified' },
    { value: 0, target: 24, suffix: '/7', prefix: '', label: 'Expert Support', icon: 'support_agent' },
    { value: 0, target: 50, suffix: 'M+', prefix: '$', label: 'Coverage Provided', icon: 'monetization_on' },
  ]);

  features: Feature[] = [
    {
      icon: 'smart_toy',
      title: 'Smart Claims Processing',
      description:
        'AI-powered claims workflow with automated fraud detection and real-time status updates via WebSocket.',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    },
    {
      icon: 'policy',
      title: 'Flexible Policy Management',
      description:
        'Create and manage CAR, HEALTH, LIFE, HOME, TRAVEL, PET, GADGET, BUSINESS, RENTAL, and CYBER policies. Full CRUD with instant updates.',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    },
    {
      icon: 'bolt',
      title: 'Real-time Updates',
      description:
        'Live claim status tracking powered by Socket.IO. Never miss a critical update with instant notifications.',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    },
  ];

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.counterStartTimer = setTimeout(() => this.animateCounters(), 400);
  }

  private animateCounters(): void {
    const current = this.stats();
    current.forEach((stat, index) => {
      const duration = 1800 + index * 200;
      const steps = 60;
      const increment = stat.target / steps;
      let count = 0;

      const timer = setInterval(() => {
        count++;
        const value = Math.min(Math.round(increment * count), stat.target);
        this.stats.update((list) => list.map((s, i) => (i === index ? { ...s, value } : s)));
        if (value >= stat.target) clearInterval(timer);
      }, duration / steps);

      this.timers.push(timer);
    });
  }

  ngOnDestroy(): void {
    if (this.counterStartTimer) clearTimeout(this.counterStartTimer);
    this.timers.forEach(clearInterval);
  }
}
