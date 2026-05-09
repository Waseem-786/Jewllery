import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, OrderResponse } from '../../../core/orders.service';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-status.html',
  styleUrls: ['./order-status.scss'],
})
export class OrderStatus implements OnInit {

  /** Variant comes from the route data: 'success' | 'failure' */
  readonly variant = signal<'success' | 'failure'>('success');
  readonly order = signal<OrderResponse | null>(null);
  readonly loading = signal(true);

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    this.variant.set(this.route.snapshot.data['variant'] === 'failure' ? 'failure' : 'success');

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) { this.loading.set(false); return; }

    this.orderService.get(Number(idParam)).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
