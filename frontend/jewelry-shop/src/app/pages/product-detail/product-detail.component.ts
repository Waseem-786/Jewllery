import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/models';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    template: `
    <div class="container detail-page" *ngIf="product && !loading">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/">Home</a> /
        <a routerLink="/shop">Shop</a> /
        <span>{{ product.name }}</span>
      </div>

      <div class="detail-layout">
        <!-- Image -->
        <div class="detail-image-wrap">
          <img [src]="product.imageUrl" [alt]="product.name" />
          <div class="img-badge" *ngIf="product.isFeatured">✦ Featured Piece</div>
        </div>

        <!-- Info -->
        <div class="detail-info">
          <span class="product-category">{{ product.categoryName }}</span>
          <h1>{{ product.name }}</h1>
          <div class="detail-price">PKR {{ product.price | number }}</div>

          <div class="detail-specs">
            <div class="spec"><span class="spec-label">Material</span><span class="spec-value">{{ product.material }}</span></div>
            <div class="spec"><span class="spec-label">Purity</span><span class="spec-value">{{ product.purity }}</span></div>
            <div class="spec"><span class="spec-label">Weight</span><span class="spec-value">{{ product.weight }}g</span></div>
            <div class="spec"><span class="spec-label">Availability</span>
              <span class="spec-value" [class.in-stock]="product.stock > 0" [class.no-stock]="product.stock === 0">
                {{ product.stock > 0 ? 'In Stock (' + product.stock + ')' : 'Out of Stock' }}
              </span>
            </div>
          </div>

          <p class="detail-description">{{ product.description }}</p>

          <div class="qty-selector" *ngIf="product.stock > 0">
            <label>Quantity</label>
            <div class="qty-controls">
              <button class="qty-btn" (click)="qty = qty > 1 ? qty - 1 : qty">−</button>
              <span class="qty-value">{{ qty }}</span>
              <button class="qty-btn" (click)="qty = qty < product.stock ? qty + 1 : qty">+</button>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn btn-gold" [disabled]="product.stock === 0" (click)="addToCart()">
              🛒 Add to Cart
            </button>
            <a routerLink="/shop" class="btn btn-ghost">← Back to Shop</a>
          </div>

          <div class="alert alert-success" *ngIf="addedMessage">{{ addedMessage }}</div>
          <div class="alert alert-error" *ngIf="loginMessage">{{ loginMessage }}</div>

          <div class="detail-tags">
            <span class="detail-tag">Certified Authentic</span>
            <span class="detail-tag">Hallmarked</span>
            <span class="detail-tag">Free Insured Delivery</span>
          </div>
        </div>
      </div>
    </div>

    <div class="spinner" *ngIf="loading"></div>
    <div class="empty-state" *ngIf="!loading && !product">
      <div class="empty-icon">💎</div>
      <h3>Product not found</h3>
      <a routerLink="/shop" class="btn btn-outline">Back to Shop</a>
    </div>
  `,
    styles: [`
    .detail-page { padding: 32px 24px 64px; }
    .breadcrumb { display: flex; gap: 8px; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 36px; }
    .breadcrumb a { color: var(--color-text-muted); }
    .breadcrumb a:hover { color: var(--color-gold); }
    .breadcrumb span { color: var(--color-text); }

    .detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }

    .detail-image-wrap { position: relative; border-radius: var(--radius-xl); overflow: hidden; aspect-ratio: 1; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
    .detail-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .img-badge { position: absolute; top: 18px; left: 18px; background: var(--color-gold); color: #1a1200; padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; }

    .detail-info { padding: 8px 0; }
    .product-category { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-gold); display: block; margin-bottom: 10px; }
    .detail-info h1 { font-family: var(--font-heading); font-size: clamp(1.8rem, 3vw, 2.4rem); color: var(--color-white); margin-bottom: 16px; line-height: 1.2; }
    .detail-price { font-family: var(--font-heading); font-size: 2rem; color: var(--color-gold); font-weight: 600; margin-bottom: 28px; }

    .detail-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px; }
    .spec { display: flex; flex-direction: column; gap: 4px; }
    .spec-label { font-size: 0.73rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); }
    .spec-value { font-size: 0.95rem; font-weight: 500; color: var(--color-text); }
    .in-stock { color: var(--color-success) !important; }
    .no-stock { color: var(--color-error) !important; }

    .detail-description { color: var(--color-text-muted); line-height: 1.8; margin-bottom: 28px; }

    .qty-selector { margin-bottom: 24px; }
    .qty-selector label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); display: block; margin-bottom: 12px; }
    .qty-controls { display: flex; align-items: center; gap: 0; width: fit-content; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
    .qty-btn { width: 44px; height: 44px; background: var(--color-surface2); border: none; color: var(--color-text); font-size: 1.2rem; cursor: pointer; transition: background 0.2s; }
    .qty-btn:hover { background: rgba(212,175,55,0.1); color: var(--color-gold); }
    .qty-value { padding: 0 20px; font-weight: 600; font-size: 1rem; min-width: 50px; text-align: center; }

    .detail-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }

    .detail-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
    .detail-tag { font-size: 0.78rem; color: var(--color-text-muted); border: 1px solid var(--color-border); padding: 5px 14px; border-radius: 100px; }

    @media (max-width: 860px) { .detail-layout { grid-template-columns: 1fr; } }
  `]
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    loading = true;
    qty = 1;
    addedMessage = '';
    loginMessage = '';

    constructor(
        private route: ActivatedRoute,
        private productSvc: ProductService,
        private cartSvc: CartService,
        private auth: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.productSvc.getProduct(id).subscribe({
            next: p => { this.product = p; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    addToCart(): void {
        if (!this.auth.isLoggedIn) {
            this.loginMessage = 'Please sign in to add items to cart.';
            setTimeout(() => this.router.navigate(['/auth/login']), 1500);
            return;
        }
        this.cartSvc.addToCart(this.product!, this.qty);
        this.addedMessage = `✓ ${this.qty}x "${this.product!.name}" added to cart!`;
        setTimeout(() => this.addedMessage = '', 3000);
    }
}
