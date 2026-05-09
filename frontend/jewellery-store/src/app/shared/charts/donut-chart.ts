import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="donut">
      <svg viewBox="0 0 120 120" class="donut-svg">
        @if (total() === 0) {
          <circle cx="60" cy="60" r="48" fill="none"
                  stroke="rgba(255,255,255,0.1)" stroke-width="14" />
        } @else {
          @for (arc of arcs(); track arc.label) {
            <circle cx="60" cy="60" r="48" fill="none"
                    [attr.stroke]="arc.color"
                    stroke-width="14"
                    [attr.stroke-dasharray]="arc.dasharray"
                    [attr.stroke-dashoffset]="arc.dashoffset"
                    transform="rotate(-90 60 60)" />
          }
        }
        <text x="60" y="56" text-anchor="middle"
              fill="#fff" font-size="13" font-family="Playfair Display, serif">
          {{ total() }}
        </text>
        <text x="60" y="70" text-anchor="middle"
              fill="rgba(255,255,255,0.5)" font-size="7"
              letter-spacing="1.5" font-family="Inter, sans-serif">
          {{ centerLabel }}
        </text>
      </svg>

      <ul class="legend">
        @for (s of slices(); track s.label) {
          <li>
            <span class="dot" [style.background]="s.color"></span>
            <span class="lbl">{{ s.label }}</span>
            <span class="val">{{ s.value }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [`
    .donut {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .donut-svg {
      width: 160px;
      height: 160px;
      flex-shrink: 0;
    }
    .legend {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }
    .legend li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.3px;
    }
    .legend .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend .lbl {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .legend .val {
      font-family: 'Playfair Display', serif;
      color: #c9a961;
    }
    @media (max-width: 600px) {
      .donut { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class DonutChart {
  @Input({ required: true }) set data(v: DonutSlice[]) { this.slicesIn.set(v ?? []); }
  @Input() centerLabel = 'TOTAL';

  protected readonly slicesIn = signal<DonutSlice[]>([]);
  protected readonly slices = computed(() => this.slicesIn().filter(s => s.value > 0));
  protected readonly total = computed(() => this.slices().reduce((sum, s) => sum + s.value, 0));

  // Circumference of r=48 circle
  private readonly C = 2 * Math.PI * 48;

  protected readonly arcs = computed(() => {
    const total = this.total();
    if (total === 0) return [];
    let offset = 0;
    return this.slices().map(s => {
      const length = (s.value / total) * this.C;
      const arc = {
        label: s.label,
        color: s.color,
        dasharray: `${length} ${this.C - length}`,
        dashoffset: -offset,
      };
      offset += length;
      return arc;
    });
  });
}
