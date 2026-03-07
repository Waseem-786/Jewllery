import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    template: `
    <div class="container cart-page">
      <h1 class="section-title" style="text-align:left;margin-bottom:8px;">Shopping Cart</h1>
      <div class="gold-line" style="margin:0 0 32px 0;"></div>

      <ng-container *ngIf="(cart.items$ | async) as items">
        <div class="cart-layout" *ngIf="items.length > 0; else emptyCart">
          <!-- Items -->
          <div class="cart-items">
            <div class="cart-item" *ngFor="let item of items">
              <div class="item-img">
                <img [src]="item.product.imageUrl" [alt]="item.product.name" />
              </div>
              <div class="item-details">
                <span class="item-category">{{ item.product.categoryName }}</span>
                <h3>{{ item.product.name }}</h3>
                <span class="item-purity">{{ item.product.purity }} · {{ item.product.material }}</span>
                <div class="item-actions">
                  <div class="qty-controls">
                    <button class="qty-btn" (click)="cart.updateQuantity(item.product.id, item.quantity - 1)">−</button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="cart.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                  </div>
                  <button class="remove-btn" (click)="cart.removeItem(item.product.id)">🗑 Remove</button>
                </div>
              </div>
              <div class="item-price">
                <span class="price-tag">PKR {{ (item.product.price * item.quantity) | number }}</span>
                <span class="item-unit">PKR {{ item.product.price | number }} each</span>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row" *ngFor="let item of items">
              <span>{{ item.product.name }} ×{{ item.quantity }}</span>
              <span>PKR {{ (item.product.price * item.quantity) | number }}</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span class="price-tag">PKR {{ cart.totalPrice | number }}</span>
            </div>

            <div class="form-group" style="margin-top:24px;">
              <label>Shipping Address</label>
              <textarea class="form-control" rows="3" [(ngModel)]="address" placeholder="Street, City, Province, Postal Code"></textarea>
            </div>

            <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
            <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>

            <button class="btn btn-gold btn-full" (click)="placeOrder(items)" [disabled]="loading || !address.trim()">
              {{ loading ? 'Placing Order...' : '✦ Place Order' }}
            </button>

            <a routerLink="/shop" class="btn btn-ghost btn-full" style="margin-top:10px;justify-content:center;">
              Continue Shopping
            </a>
          </div>
        </div>

        <ng-template #emptyCart>
          <div class="empty-state">
            <div class="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Discover our beautiful jewellery collection and add something special.</p>
            <a routerLink="/shop" class="btn btn-gold">Explore Collection</a>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `,
    styles: [`
    .cart-page { padding: 48px 24px 80px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }
    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 20px;
      align-items: center;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px;
      transition: border-color 0.2s;
    }
    .cart-item:hover { border-color: rgba(212,175,55,0.2); }
    .item-img { width: 100px; height: 100px; border-radius: var(--radius-md); overflow: hidden; }
    .item-img img { width: 100%; height: 100%; object-fit: cover; }
    .item-details { display: flex; flex-direction: column; gap: 4px; }
    .item-category { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-gold); }
    .item-details h3 { font-family: var(--font-heading); font-size: 1rem; color: var(--color-white); }
    .item-purity { font-size: 0.8rem; color: var(--color-text-muted); }
    .item-actions { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
    .qty-controls { display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; }
    .qty-btn { width: 34px; height: 34px; background: var(--color-surface2); border: none; color: var(--color-text); cursor: pointer; font-size: 1rem; transition: background 0.2s; }
    .qty-btn:hover { background: rgba(212,175,55,0.1); color: var(--color-gold); }
    .qty-value { padding: 0 14px; font-weight: 600; }
    .remove-btn { background: none; border: none; color: var(--color-text-muted); font-size: 0.82rem; cursor: pointer; transition: color 0.2s; }
    .remove-btn:hover { color: var(--color-error); }
    .item-price { text-align: right; }
    .item-unit { display: block; font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px; }

    .cart-summary { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 28px; position: sticky; top: 100px; }
    .cart-summary h2 { font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 20px; color: var(--color-white); }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--color-text-muted); margin-bottom: 8px; }
    .summary-total { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 12px; font-weight: 600; }
    .btn-full { width: 100%; justify-content: center; padding: 14px; font-size: 0.95rem; }

    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .cart-item { grid-template-columns: 80px 1fr; } .item-price { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 16px; align-items: center; } }
  `]
})
export class CartComponent {
    address = '';
    loading = false;
    errorMsg = '';
    successMsg = '';

    constructor(public cart: CartService, private orderSvc: OrderService, private router: Router) { }

    placeOrder(items: any[]): void {
        if (!this.address.trim()) return;
        this.loading = true;
        this.errorMsg = '';

        this.orderSvc.placeOrder({
            shippingAddress: this.address,
            items: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
        }).subscribe({
            next: (order) => {
                this.cart.clearCart();
                this.successMsg = `✓ Order #${order.id} placed successfully! Redirecting to your orders...`;
                setTimeout(() => this.router.navigate(['/orders']), 2500);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Failed to place order. Please try again.';
                this.loading = false;
            }
        });
    }
}
