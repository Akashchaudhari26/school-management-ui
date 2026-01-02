import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // We use Signals for modern, reactive state management
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info') {
    const id = Date.now();
    const newToast: Toast = { message, type, id };

    // Add to list
    this.toasts.update(current => [...current, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}