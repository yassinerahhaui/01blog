import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary';

export interface ToastMessage {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
}

export interface ToastOptions {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Toast {
  toasts = signal<ToastMessage[]>([]);

  // Track auto-dismiss timers so manual dismiss can cancel them.
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly defaultDuration = 3500;

  show(options: ToastOptions): string {
    const id = this.createId();
    const toast: ToastMessage = {
      id,
      message: options.message,
      title: options.title,
      variant: options.variant ?? 'primary',
    };

    this.toasts.update((current) => [toast, ...current]);

    const duration = options.duration ?? this.defaultDuration;
    if (duration > 0) {
      const timeoutId = setTimeout(() => this.dismiss(id), duration);
      this.timeouts.set(id, timeoutId);
    }

    return id;
  }

  dismiss(id: string): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }

    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts.clear();
    this.toasts.set([]);
  }

  private createId(): string {
    return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
