import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../models/models';

@Component({
    selector: 'app-shop',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    template: `
    <div class="shop-page">
      <!-- Header -->
      <div class="shop-header">
        <div class="container">
          <h1 class="section-title">Our Collection</h1>
          <div class="gold-line"></div>
          <p class="section-subtitle">{{ filteredProducts.length }} pieces available</p>
        </div>
      </div>

      <div class="container shop-layout">
        <!-- Sidebar Filters -->
        <aside class="sidebar">
          <div class="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              class="form-control"
              placeholder="Search jewellery..."
              [(ngModel)]="search"
              (ngModelChange)="applyFilters()"
            />
          </div>

          <div class="filter-section">
            <h3>Categories</h3>
            <button class="filter-btn" [class.active]="!selectedCategory" (click)="selectCategory(null)">
              All Categories
            </button>
            <button *ngFor="let cat of categories"
                    class="filter-btn"
                    [class.active]="selectedCategory === cat.id"
                    (click)="selectCategory(cat.id)">
              {{ cat.name }}
              <span class="filter-count">{{ cat.productCount }}</span>
            </button>
          </div>

          <div class="filter-section">
            <h3>Sort By</h3>
            <select class="form-control" [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </aside>

        <!-- Products Grid -->
        <div class="products-area">
          <div class="spinner" *ngIf="loading"></div>

          <div class="products-grid" *ngIf="!loading && filteredProducts.length > 0">
            <a *ngFor="let p of filteredProducts" [routerLink]="['/product', p.id]" class="product-card">
              <div class="product-img-wrap">
                <img [src]="p.imageUrl" [alt]="p.name" />
                <div class="product-overlay">
                  <span class="view-btn">View Details</span>
                </div>
                <span class="shop-badge" *ngIf="p.isFeatured">✦</span>
                <span class="out-badge" *ngIf="p.stock === 0">Out of Stock</span>
              </div>
              <div class="product-info">
                <span class="product-category">{{ p.categoryName }}</span>
                <h3>{{ p.name }}</h3>
                <div class="product-meta">
                  <span class="price-tag">PKR {{ p.price | number }}</span>
                  <span class="product-purity">{{ p.purity }}</span>
                </div>
              </div>
            </a>
          </div>

          <div class="empty-state" *ngIf="!loading && filteredProducts.length === 0">
            <div class="empty-icon">💎</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or category filters.</p>
            <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .shop-header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 48px 0 40px; }
    .shop-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; padding-top: 40px; padding-bottom: 60px; }

    .sidebar { position: sticky; top: 100px; height: fit-content; }
    .filter-section { margin-bottom: 28px; }
    .filter-section h3 { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 14px; }
    .filter-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-text-muted);
      font-family: var(--font-body);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
      text-align: left;
    }
    .filter-btn:hover { background: var(--color-surface2); color: var(--color-text); }
    .filter-btn.active { background: rgba(212,175,55,0.1); color: var(--color-gold); border-color: rgba(212,175,55,0.2); }
    .filter-count { font-size: 0.75rem; background: var(--color-surface2); padding: 2px 8px; border-radius: 100px; }

    .products-area { padding-bottom: 40px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }

    .product-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
      display: block;
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-card), 0 0 0 1px rgba(212,175,55,0.2);
      border-color: rgba(212,175,55,0.2);
    }
    .product-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
    .product-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
    .product-card:hover .product-img-wrap img { transform: scale(1.05); }
    .product-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s;
    }
    .product-card:hover .product-overlay { opacity: 1; }
    .view-btn { background: var(--color-gold); color: #1a1200; padding: 10px 24px; border-radius: var(--radius-md); font-weight: 600; font-size: 0.9rem; }
    .shop-badge { position: absolute; top: 10px; right: 10px; background: var(--color-gold); color: #1a1200; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
    .out-badge { position: absolute; top: 10px; left: 10px; background: rgba(224,92,92,0.85); color: white; padding: 4px 10px; border-radius: 100px; font-size: 0.72rem; font-weight: 600; }
    .product-info { padding: 16px 18px 18px; }
    .product-category { font-size: 0.73rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-gold); margin-bottom: 5px; display: block; }
    .product-info h3 { font-family: var(--font-heading); font-size: 1rem; color: var(--color-white); margin-bottom: 10px; line-height: 1.3; }
    .product-meta { display: flex; align-items: center; justify-content: space-between; }
    .product-purity { font-size: 0.75rem; color: var(--color-text-muted); background: var(--color-surface2); padding: 3px 10px; border-radius: 100px; border: 1px solid var(--color-border); }

    @media (max-width: 860px) { .shop-layout { grid-template-columns: 1fr; } .sidebar { position: static; } }
  `]
})
export class ShopComponent implements OnInit {
    products: Product[] = [];
    categories: Category[] = [];
    filteredProducts: Product[] = [];
    loading = true;
    search = '';
    selectedCategory: number | null = null;
    sortBy = 'featured';

    constructor(private productSvc: ProductService, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['categoryId']) this.selectedCategory = +params['categoryId'];
        });

        this.productSvc.getCategories().subscribe(cats => this.categories = cats);
        this.productSvc.getProducts().subscribe({
            next: prods => {
                this.products = prods;
                this.applyFilters();
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    selectCategory(id: number | null): void {
        this.selectedCategory = id;
        this.applyFilters();
    }

    applyFilters(): void {
        let result = [...this.products];

        if (this.selectedCategory)
            result = result.filter(p => p.categoryId === this.selectedCategory);

        if (this.search.trim())
            result = result.filter(p =>
                p.name.toLowerCase().includes(this.search.toLowerCase()) ||
                p.material.toLowerCase().includes(this.search.toLowerCase())
            );

        switch (this.sortBy) {
            case 'price_asc': result.sort((a, b) => a.price - b.price); break;
            case 'price_desc': result.sort((a, b) => b.price - a.price); break;
            case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            default: result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }

        this.filteredProducts = result;
    }

    clearFilters(): void {
        this.search = '';
        this.selectedCategory = null;
        this.sortBy = 'featured';
        this.applyFilters();
    }
}
