// src/app/shared/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastSubject = new Subject<Toast>();

  get toasts$(): Observable<Toast> {
    return this.toastSubject.asObservable();
  }

  success(message: string, duration = 5000): void {
    this.emit({ type: 'success', message, duration });
  }

  error(message: string, duration = 7000): void {
    this.emit({ type: 'error', message, duration });
  }

  warning(message: string, duration = 5000): void {
    this.emit({ type: 'warning', message, duration });
  }

  info(message: string, duration = 5000): void {
    this.emit({ type: 'info', message, duration });
  }

  private emit(toast: Omit<Toast, 'id'>): void {
    this.toastSubject.next({
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
  }
}
