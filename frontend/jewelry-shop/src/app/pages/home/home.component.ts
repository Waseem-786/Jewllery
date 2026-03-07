import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../models/models';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, CommonModule],
    template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <span class="hero-label">✦ Exclusive Collection 2024</span>
        <h1>Where Gold Meets <em>Grace</em></h1>
        <p>Discover handcrafted jewellery that tells your story. Every piece is a masterwork of tradition and contemporary elegance.</p>
        <div class="hero-actions">
          <a routerLink="/shop" class="btn btn-gold">Explore Collection</a>
          <a routerLink="/shop" class="btn btn-outline">View Lookbook</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>500+</strong><span>Unique Designs</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><strong>18K–22K</strong><span>Pure Gold</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><strong>50K+</strong><span>Happy Customers</span></div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-ring-glow"></div>
        <div class="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop" alt="Premium Gold Ring" class="hero-img" />
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="container">
        <p class="section-label">Browse by</p>
        <h2 class="section-title">Collections</h2>
        <div class="gold-line"></div>
        <p class="section-subtitle">Find the perfect piece in our curated collections</p>

        <div class="categories-grid" *ngIf="!catLoading; else catLoader">
          <a *ngFor="let cat of categories"
             [routerLink]="['/shop']"
             [queryParams]="{categoryId: cat.id}"
             class="cat-card">
            <div class="cat-image-wrap">
              <img [src]="cat.imageUrl" [alt]="cat.name" />
              <div class="cat-overlay"></div>
            </div>
            <div class="cat-info">
              <h3>{{ cat.name }}</h3>
              <span>{{ cat.productCount }} pieces</span>
            </div>
          </a>
        </div>
        <ng-template #catLoader>
          <div class="spinner"></div>
        </ng-template>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-section">
      <div class="container">
        <p class="section-label">Handpicked for You</p>
        <h2 class="section-title">Featured Pieces</h2>
        <div class="gold-line"></div>
        <p class="section-subtitle">Our most beloved designs, loved by thousands</p>

        <div class="products-grid" *ngIf="!prodLoading; else prodLoader">
          <a *ngFor="let p of featured" [routerLink]="['/product', p.id]" class="product-card">
            <div class="product-img-wrap">
              <img [src]="p.imageUrl" [alt]="p.name" />
              <div class="product-overlay">
                <span class="view-btn">View Details</span>
              </div>
              <span class="product-badge" *ngIf="p.isFeatured">✦ Featured</span>
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
        <ng-template #prodLoader>
          <div class="spinner"></div>
        </ng-template>

        <div class="featured-cta">
          <a routerLink="/shop" class="btn btn-outline">View All Jewellery →</a>
        </div>
      </div>
    </section>

    <!-- Why Us -->
    <section class="why-section">
      <div class="container">
        <h2 class="section-title">Why Gold &amp; Grace?</h2>
        <div class="gold-line"></div>
        <div class="why-grid">
          <div class="why-card">
            <span class="why-icon">💎</span>
            <h3>Certified Purity</h3>
            <p>Every piece is hallmarked and certified, guaranteeing the gold purity you pay for.</p>
          </div>
          <div class="why-card">
            <span class="why-icon">🔨</span>
            <h3>Master Craftsmanship</h3>
            <p>Handcrafted by artisans with decades of experience in traditional and contemporary designs.</p>
          </div>
          <div class="why-card">
            <span class="why-icon">🚚</span>
            <h3>Insured Delivery</h3>
            <p>Fully insured, discreet packaging with real-time tracking delivered to your doorstep.</p>
          </div>
          <div class="why-card">
            <span class="why-icon">🔄</span>
            <h3>30-Day Returns</h3>
            <p>Not satisfied? Return any unworn piece within 30 days for a full refund, no questions asked.</p>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    /* Hero */
    .hero {
      min-height: calc(100vh - 72px);
      display: flex;
      align-items: center;
      max-width: 1280px;
      margin: 0 auto;
      padding: 60px 24px;
      gap: 60px;
    }
    .hero-content { flex: 1; }
    .hero-label {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-gold);
      border: 1px solid rgba(212,175,55,0.3);
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 24px;
    }
    .hero-content h1 {
      font-family: var(--font-heading);
      font-size: clamp(2.8rem, 5.5vw, 4.5rem);
      font-weight: 700;
      line-height: 1.1;
      color: var(--color-white);
      margin-bottom: 20px;
    }
    .hero-content h1 em { color: var(--color-gold); font-style: normal; }
    .hero-content p {
      font-size: 1.1rem;
      color: var(--color-text-muted);
      max-width: 480px;
      margin-bottom: 36px;
      line-height: 1.8;
    }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
    .hero-stats { display: flex; align-items: center; gap: 20px; }
    .stat { display: flex; flex-direction: column; }
    .stat strong { font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-gold); }
    .stat span { font-size: 0.78rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-divider { width: 1px; height: 36px; background: var(--color-border); }

    .hero-visual { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; height: 520px; }
    .hero-ring-glow {
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%);
      border-radius: 50%;
    }
    .hero-image-wrap {
      width: 380px; height: 380px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(212,175,55,0.2);
      box-shadow: 0 0 60px rgba(212,175,55,0.12), var(--shadow-card);
      position: relative;
      z-index: 1;
    }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }

    /* Categories */
    .categories-section { padding: 80px 0; }
    .section-label { text-align: center; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-gold); margin-bottom: 8px; }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .cat-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: relative;
      cursor: pointer;
      display: block;
    }
    .cat-image-wrap { position: relative; aspect-ratio: 3/4; overflow: hidden; }
    .cat-image-wrap img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
    }
    .cat-card:hover .cat-image-wrap img { transform: scale(1.08); }
    .cat-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%);
    }
    .cat-info {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 20px;
    }
    .cat-info h3 { font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-white); margin-bottom: 4px; }
    .cat-info span { font-size: 0.8rem; color: rgba(255,255,255,0.6); }

    /* Featured */
    .featured-section { padding: 80px 0; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 28px;
    }
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
      opacity: 0;
      transition: opacity 0.3s;
    }
    .product-card:hover .product-overlay { opacity: 1; }
    .view-btn {
      background: var(--color-gold);
      color: #1a1200;
      padding: 10px 24px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .product-badge {
      position: absolute; top: 12px; right: 12px;
      background: var(--color-gold);
      color: #1a1200;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .product-info { padding: 18px 20px 20px; }
    .product-category { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-gold); margin-bottom: 6px; display: block; }
    .product-info h3 { font-family: var(--font-heading); font-size: 1.05rem; color: var(--color-white); margin-bottom: 10px; }
    .product-meta { display: flex; align-items: center; justify-content: space-between; }
    .product-purity { font-size: 0.78rem; color: var(--color-text-muted); background: var(--color-surface2); padding: 3px 10px; border-radius: 100px; border: 1px solid var(--color-border); }

    .featured-cta { text-align: center; margin-top: 48px; }

    /* Why Us */
    .why-section { padding: 80px 0 60px; background: var(--color-surface); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
    .why-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 32px; margin-top: 48px; }
    .why-card {
      text-align: center;
      padding: 40px 24px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .why-card:hover { border-color: rgba(212,175,55,0.2); box-shadow: var(--shadow-gold); }
    .why-icon { font-size: 2.5rem; display: block; margin-bottom: 16px; }
    .why-card h3 { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-white); margin-bottom: 10px; }
    .why-card p { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.7; }

    @media (max-width: 900px) {
      .hero { flex-direction: column; min-height: auto; padding: 40px 24px; }
      .hero-visual { height: 300px; }
      .hero-image-wrap { width: 260px; height: 260px; }
      .hero-ring-glow { width: 280px; height: 280px; }
    }
  `]
})
export class HomeComponent implements OnInit {
    categories: Category[] = [];
    featured: Product[] = [];
    catLoading = true;
    prodLoading = true;

    constructor(private productSvc: ProductService) { }

    ngOnInit(): void {
        this.productSvc.getCategories().subscribe({
            next: cats => { this.categories = cats; this.catLoading = false; },
            error: () => { this.catLoading = false; }
        });
        this.productSvc.getProducts({ featured: true }).subscribe({
            next: prods => { this.featured = prods.slice(0, 8); this.prodLoading = false; },
            error: () => { this.prodLoading = false; }
        });
    }
}
