import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LinePoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" class="line-chart" preserveAspectRatio="none">
      <!-- Y-axis grid -->
      @for (y of gridLines(); track y) {
        <line [attr.x1]="padL" [attr.x2]="W - padR" [attr.y1]="y" [attr.y2]="y"
              stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      }

      <!-- Area fill -->
      @if (areaPath()) {
        <path [attr.d]="areaPath()" fill="url(#lc-grad)" />
      }

      <!-- Line -->
      @if (linePath()) {
        <path [attr.d]="linePath()" fill="none" stroke="#c9a961" stroke-width="2" />
      }

      <!-- Dots -->
      @for (p of plotted(); track p.x) {
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="#c9a961" />
      }

      <!-- X-axis labels (every 2nd) -->
      @for (p of plotted(); track p.x; let i = $index) {
        @if (i % 2 === 0) {
          <text [attr.x]="p.x" [attr.y]="H - 6" fill="rgba(255,255,255,0.45)"
                font-size="9" text-anchor="middle" font-family="Inter, sans-serif">
            {{ p.label }}
          </text>
        }
      }

      <!-- Y-axis ticks (top + bottom value) -->
      <text [attr.x]="padL - 6" [attr.y]="padT + 4" fill="rgba(255,255,255,0.45)"
            font-size="9" text-anchor="end" font-family="Inter, sans-serif">
        {{ formatVal(maxVal()) }}
      </text>
      <text [attr.x]="padL - 6" [attr.y]="H - padB" fill="rgba(255,255,255,0.45)"
            font-size="9" text-anchor="end" font-family="Inter, sans-serif">0</text>

      <defs>
        <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c9a961" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#c9a961" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  `,
  styles: [`
    .line-chart {
      width: 100%;
      height: 220px;
      display: block;
    }
  `],
})
export class LineChart {
  @Input({ required: true }) set points(v: LinePoint[]) { this.data.set(v ?? []); }
  @Input() valuePrefix = '';

  protected readonly data = signal<LinePoint[]>([]);

  protected readonly W = 600;
  protected readonly H = 240;
  protected readonly padL = 40;
  protected readonly padR = 16;
  protected readonly padT = 16;
  protected readonly padB = 24;

  protected readonly maxVal = computed(() => {
    const m = Math.max(0, ...this.data().map(p => p.value));
    return m === 0 ? 1 : m;
  });

  protected readonly plotted = computed(() => {
    const pts = this.data();
    if (pts.length === 0) return [];
    const innerW = this.W - this.padL - this.padR;
    const innerH = this.H - this.padT - this.padB;
    const max = this.maxVal();
    const stepX = pts.length === 1 ? 0 : innerW / (pts.length - 1);
    return pts.map((p, i) => ({
      x: this.padL + stepX * i,
      y: this.padT + innerH - (p.value / max) * innerH,
      value: p.value,
      label: p.label,
    }));
  });

  protected readonly linePath = computed(() => {
    const pts = this.plotted();
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  });

  protected readonly areaPath = computed(() => {
    const pts = this.plotted();
    if (pts.length === 0) return '';
    const baseY = this.H - this.padB;
    return [
      `M ${pts[0].x} ${baseY}`,
      ...pts.map(p => `L ${p.x} ${p.y}`),
      `L ${pts[pts.length - 1].x} ${baseY}`,
      'Z',
    ].join(' ');
  });

  protected readonly gridLines = computed(() => {
    const innerH = this.H - this.padT - this.padB;
    return [0, 0.25, 0.5, 0.75, 1].map(t => this.padT + innerH * t);
  });

  protected formatVal(v: number): string {
    if (v >= 1_000_000) return `${this.valuePrefix}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${this.valuePrefix}${(v / 1_000).toFixed(1)}k`;
    return `${this.valuePrefix}${v.toFixed(0)}`;
  }
}
