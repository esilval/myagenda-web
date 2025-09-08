import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';
export type Toast = { id: number; message: string; type: ToastType };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private _seq = 1;

  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', durationMs = 3000) {
    const id = this._seq++;
    const toast: Toast = { id, message, type };
    this._toasts.update((arr) => [...arr, toast]);
    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  dismiss(id: number) {
    this._toasts.update((arr) => arr.filter((t) => t.id !== id));
  }
}


