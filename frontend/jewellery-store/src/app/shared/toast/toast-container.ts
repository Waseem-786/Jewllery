import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" role="region" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast" [class.success]="t.kind==='success'" [class.error]="t.kind==='error'" [class.info]="t.kind==='info'">
          <div class="icon" aria-hidden="true">
            @switch (t.kind) {
              @case ('success') {
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/>
                </svg>
              }
              @case ('error') {
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
              }
              @default {
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                </svg>
              }
            }
          </div>
          <div class="body">
            @if (t.title) { <div class="title">{{ t.title }}</div> }
            <div class="message">{{ t.message }}</div>
          </div>
          <button class="close" (click)="toasts.dismiss(t.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(420px, calc(100% - 32px));
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 18px 16px 14px;
      background: #0b0b0b;
      color: #f0eee9;
      border: 1px solid rgba(201, 169, 97, 0.25);
      border-left-width: 3px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);
      animation: toast-in 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
      font-family: 'Inter', system-ui, sans-serif;
      letter-spacing: 0.2px;
    }

    .toast.success { border-left-color: #6fbf73; }
    .toast.success .icon { color: #6fbf73; }
    .toast.error   { border-left-color: #c97070; }
    .toast.error   .icon { color: #c97070; }
    .toast.info    { border-left-color: #c9a961; }
    .toast.info    .icon { color: #c9a961; }

    .icon { flex-shrink: 0; padding-top: 1px; }

    .body { flex: 1; min-width: 0; }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      color: #fff;
    }
    .message {
      font-size: 13px;
      line-height: 1.55;
      color: rgba(255,255,255,0.85);
      word-wrap: break-word;
    }

    .close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.45);
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 2px 6px;
      transition: color 0.2s ease;
    }
    .close:hover { color: #fff; }

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 600px) {
      .toast-stack { top: 16px; }
    }
  `],
})
export class ToastContainer {
  constructor(public toasts: ToastService) {}
}
