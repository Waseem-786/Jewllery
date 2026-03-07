import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderResponse } from '../../models/models';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [RouterLink, CommonModule, DatePipe],
    template: `
    <div class="container orders-page">
      <h1 class="section-title" style="text-align:left;margin-bottom:8px;">My Orders</h1>
      <div class="gold-line" style="margin:0 0 32px 0;"></div>

      <div class="spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div class="order-id-info">
              <span class="order-label">Order</span>
              <strong class="order-id">#{{ order.id }}</strong>
            </div>
            <div>
              <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
            </div>
            <div class="order-date">{{ order.createdAt | date:'medium' }}</div>
            <div class="order-total price-tag">PKR {{ order.totalAmount | number }}</div>
          </div>

          <div class="order-items">
            <div class="order-item" *ngFor="let item of order.items">
              <img [src]="item.productImage" [alt]="item.productName" />
              <div class="order-item-info">
                <strong>{{ item.productName }}</strong>
                <span>Qty: {{ item.quantity }} × PKR {{ item.unitPrice | number }}</span>
              </div>
              <span class="order-item-total">PKR {{ (item.quantity * item.unitPrice) | number }}</span>
            </div>
          </div>

          <div class="order-footer">
            <span class="shipping-addr">📍 {{ order.shippingAddress }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && orders.length === 0">
        <div class="empty-icon">📦</div>
        <h3>No orders yet</h3>
        <p>You haven't placed any orders. Start shopping!</p>
        <a routerLink="/shop" class="btn btn-gold">Explore Collection</a>
      </div>
    </div>
  `,
    styles: [`
    .orders-page { padding: 48px 24px 80px; }
    .order-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: 24px; overflow: hidden; transition: border-color 0.2s; }
    .order-card:hover { border-color: rgba(212,175,55,0.2); }
    .order-header { display: grid; grid-template-columns: 1fr auto auto auto; gap: 24px; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
    .order-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); display: block; }
    .order-id { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-white); }
    .order-date { font-size: 0.85rem; color: var(--color-text-muted); }
    .status-badge { font-size: 0.78rem; font-weight: 600; padding: 5px 14px; border-radius: 100px; }
    .status-pending { background: rgba(212,175,55,0.15); color: var(--color-gold); border: 1px solid rgba(212,175,55,0.3); }
    .status-processing { background: rgba(76,100,175,0.15); color: #6b9de8; border: 1px solid rgba(76,100,175,0.3); }
    .status-shipped { background: rgba(76,150,175,0.15); color: #5abcd8; border: 1px solid rgba(76,150,175,0.3); }
    .status-delivered { background: rgba(76,175,125,0.15); color: var(--color-success); border: 1px solid rgba(76,175,125,0.3); }
    .status-cancelled { background: rgba(224,92,92,0.15); color: var(--color-error); border: 1px solid rgba(224,92,92,0.3); }
    .order-items { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
    .order-item { display: grid; grid-template-columns: 56px 1fr auto; gap: 16px; align-items: center; }
    .order-item img { width: 56px; height: 56px; border-radius: var(--radius-sm); object-fit: cover; }
    .order-item-info { display: flex; flex-direction: column; gap: 2px; }
    .order-item-info strong { font-size: 0.9rem; color: var(--color-text); }
    .order-item-info span { font-size: 0.8rem; color: var(--color-text-muted); }
    .order-item-total { font-size: 0.9rem; font-weight: 500; color: var(--color-gold); white-space: nowrap; }
    .order-footer { padding: 12px 24px; background: var(--color-surface2); border-top: 1px solid var(--color-border); }
    .shipping-addr { font-size: 0.83rem; color: var(--color-text-muted); }
  `]
})
export class OrdersComponent implements OnInit {
    orders: OrderResponse[] = [];
    loading = true;

    constructor(private orderSvc: OrderService) { }

    ngOnInit(): void {
        this.orderSvc.getMyOrders().subscribe({
            next: orders => { this.orders = orders; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }
}
