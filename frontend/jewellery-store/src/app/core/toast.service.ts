import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  title?: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, kind: ToastKind, opts?: { title?: string; durationMs?: number }): number {
    const id = this.nextId++;
    const toast: Toast = { id, message, kind, title: opts?.title };
    this._toasts.update(list => [...list, toast]);
    const duration = opts?.durationMs ?? (kind === 'error' ? 6000 : 3500);
    if (duration > 0 && typeof window !== 'undefined') {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string, title?: string): number { return this.show(message, 'success', { title }); }
  error  (message: string, title?: string): number { return this.show(message, 'error',   { title }); }
  info   (message: string, title?: string): number { return this.show(message, 'info',    { title }); }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clear(): void { this._toasts.set([]); }
}
