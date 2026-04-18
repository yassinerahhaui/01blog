import { Injectable, signal } from '@angular/core';

export type PopupKind = 'alert' | 'confirm';

export interface PopupState {
  kind: PopupKind;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  confirmVariant: 'primary' | 'danger' | 'warning' | 'success' | 'secondary';
}

export interface AlertPopupOptions {
  title?: string;
  message: string;
  confirmText?: string;
  confirmVariant?: PopupState['confirmVariant'];
}

export interface ConfirmPopupOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: PopupState['confirmVariant'];
}

@Injectable({
  providedIn: 'root',
})
export class Popup {
  state = signal<PopupState | null>(null);

  private resolver: ((result: boolean) => void) | null = null;

  alert(options: AlertPopupOptions): Promise<void> {
    return new Promise<void>((resolve) => {
      this.resolver = () => {
        resolve();
      };

      this.state.set({
        kind: 'alert',
        title: options.title ?? 'Notice',
        message: options.message,
        confirmText: options.confirmText ?? 'OK',
        confirmVariant: options.confirmVariant ?? 'primary',
      });
    });
  }

  confirm(options: ConfirmPopupOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;

      this.state.set({
        kind: 'confirm',
        title: options.title ?? 'Confirm action',
        message: options.message,
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        confirmVariant: options.confirmVariant ?? 'danger',
      });
    });
  }

  onConfirm(): void {
    this.resolveAndClose(true);
  }

  onCancel(): void {
    this.resolveAndClose(false);
  }

  private resolveAndClose(result: boolean): void {
    const resolve = this.resolver;
    this.resolver = null;
    this.state.set(null);
    resolve?.(result);
  }
}
