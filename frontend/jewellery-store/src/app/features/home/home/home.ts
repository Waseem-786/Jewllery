import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/cart';
import { ProductService, Product } from '../../../core/products.service';
import { CategoryService, Category } from '../../../core/categories.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Up to 4 products from the API (already ordered with featured first). */
  readonly featuredProducts = computed(() => this.products().slice(0, 4));

  /** Up to 3 categories with at least one product. */
  readonly featuredCategories = computed(() =>
    this.categories()
      .filter(c => c.productCount > 0)
      .slice(0, 3)
  );

  showToast = false;
  private toastTimeout: any;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.productService.list({ featured: true }).subscribe({
      next: items => {
        // Fall back to all products if no featured flagged yet.
        if (items.length === 0) {
          this.productService.list().subscribe({
            next: all => { this.products.set(all); this.loading.set(false); },
            error: () => { this.error.set('Could not load products.'); this.loading.set(false); },
          });
          return;
        }
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load products.');
        this.loading.set(false);
      },
    });

    this.categoryService.list().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {/* non-fatal */ },
    });
  }

  resolveImage(url: string): string {
    return this.productService.resolveImageUrl(url);
  }

  addToCart(p: Product) {
    this.cartService.addToCart({
      productId: p.id,
      name: p.name,
      price: p.price,
      image: this.resolveImage(p.imageUrl),
    });

    this.showToast = true;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToast = false, 2000);
  }
}
