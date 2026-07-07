// src/app/shared/components/toast/toast.component.ts
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { NotificationService, Toast } from '../../services/notification.service';

interface ActiveToast extends Toast {
  progress: number;
  removing: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private sub?: Subscription;
  private timers = new Map<string, ReturnType<typeof setInterval>>();

  toasts = signal<ActiveToast[]>([]);

  ngOnInit(): void {
    this.sub = this.notificationService.toasts$.subscribe((toast) => this.addToast(toast));
  }

  addToast(toast: Toast): void {
    const active: ActiveToast = { ...toast, progress: 100, removing: false };
    this.toasts.update((list) => [...list, active]);

    const duration = toast.duration ?? 5000;
    const interval = setInterval(() => {
      this.toasts.update((list) =>
        list.map((t) =>
          t.id === toast.id
            ? { ...t, progress: Math.max(0, t.progress - 100 / (duration / 100)) }
            : t
        )
      );
    }, 100);

    this.timers.set(toast.id, interval);

    setTimeout(() => {
      clearInterval(interval);
      this.timers.delete(toast.id);
      this.dismiss(toast.id);
    }, duration);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
    this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
    }, 350);
  }

  iconFor(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type];
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.timers.forEach(clearInterval);
  }
}
