import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/cart';
import { ProductService, Product } from '../../../core/products.service';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetail implements OnInit {
  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly quantity = signal(1);

  readonly stockLabel = computed(() => {
    const p = this.product();
    if (!p) return '';
    if (p.stock <= 0) return 'Out of stock';
    if (p.stock <= 3) return `Only ${p.stock} left`;
    return 'In stock';
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private productService: ProductService,
    private cart: CartService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      const id = idStr ? Number(idStr) : NaN;
      if (!idStr || !/^\d+$/.test(idStr) || !Number.isFinite(id)) {
        this.error.set('Invalid product link.');
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.error.set(null);
      this.quantity.set(1);
      this.productService.get(id).subscribe({
        next: p => {
          this.product.set(p);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('We couldn’t find that piece. It may have been removed.');
          this.loading.set(false);
        },
      });
    });
  }

  resolveImage(url: string): string {
    return this.productService.resolveImageUrl(url);
  }

  inc(): void {
    const p = this.product(); if (!p) return;
    this.quantity.update(q => Math.min(q + 1, Math.max(p.stock, 1)));
  }
  dec(): void {
    this.quantity.update(q => Math.max(q - 1, 1));
  }

  addToCart(): void {
    const p = this.product(); if (!p) return;
    if (p.stock <= 0) { this.toast.error('This piece is currently out of stock.'); return; }
    const qty = Math.min(this.quantity(), p.stock);
    for (let i = 0; i < qty; i++) {
      this.cart.addToCart({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: this.resolveImage(p.imageUrl),
      });
    }
    this.toast.success(`${p.name} added to your cart.`, 'Added');
  }

  buyNow(): void {
    const p = this.product(); if (!p) return;
    if (p.stock <= 0) { this.toast.error('This piece is currently out of stock.'); return; }
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/shop']);
    }
  }
}
