import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/cart';
import { ProductService, Product } from '../../../core/products.service';
import { CategoryService, Category } from '../../../core/categories.service';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedCategoryId = signal<number | 'all'>('all');

  readonly filteredProducts = computed(() => {
    const sel = this.selectedCategoryId();
    if (sel === 'all') return this.products();
    return this.products().filter(p => p.categoryId === sel);
  });

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const raw = params.get('category');
      if (raw && /^\d+$/.test(raw)) {
        this.selectedCategoryId.set(Number(raw));
      } else {
        this.selectedCategoryId.set('all');
      }
    });

    this.productService.list().subscribe({
      next: items => {
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load products. Make sure the API is running.');
        this.loading.set(false);
      },
    });
    this.categoryService.list().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {/* non-fatal */ },
    });
  }

  setCategory(id: number | 'all'): void {
    this.selectedCategoryId.set(id);
  }

  resolveImage(url: string): string {
    return this.productService.resolveImageUrl(url);
  }

  addToCart(p: Product): void {
    if (p.stock <= 0) { this.toast.error('This piece is currently out of stock.'); return; }
    this.cartService.addToCart({
      productId: p.id,
      name: p.name,
      price: p.price,
      image: this.resolveImage(p.imageUrl),
    });
    this.toast.success(`${p.name} added to your cart.`, 'Added');
  }

  buyNow(p: Product): void {
    if (p.stock <= 0) { this.toast.error('This piece is currently out of stock.'); return; }
    this.cartService.addToCart({
      productId: p.id,
      name: p.name,
      price: p.price,
      image: this.resolveImage(p.imageUrl),
    });
    this.router.navigate(['/checkout']);
  }
}
