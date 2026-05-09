import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ProductService, Product, CreateProductInput } from '../../../core/products.service';
import { CategoryService, Category, CreateCategoryInput } from '../../../core/categories.service';
import {
  AdminService, AdminOrder, AdminUser, DashboardStats,
  ORDER_STATUSES, OrderStatus,
} from '../../../core/admin.service';
import { LineChart, LinePoint } from '../../../shared/charts/line-chart';
import { DonutChart, DonutSlice } from '../../../shared/charts/donut-chart';

type Tab = 'overview' | 'orders' | 'products' | 'categories' | 'users';

interface ProductForm {
  id: number | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  weight: number;
  material: string;
  purity: string;
  badge: string;
  featuresText: string;
  isFeatured: boolean;
  categoryId: number | null;
}

interface CategoryForm {
  id: number | null;
  name: string;
  imageUrl: string;
  description: string;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:    '#d4a548',
  Processing: '#7fa1d4',
  Shipped:    '#9b87d4',
  Delivered:  '#6fbf73',
  Cancelled:  '#c97070',
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, LineChart, DonutChart],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard implements OnInit {
  readonly tab = signal<Tab>('overview');
  readonly statuses = ORDER_STATUSES;
  readonly statusColors = STATUS_COLORS;

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly orders = signal<AdminOrder[]>([]);
  readonly users = signal<AdminUser[]>([]);
  readonly stats = signal<DashboardStats | null>(null);

  readonly status = signal<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  readonly uploading = signal(false);
  readonly loadingStats = signal(false);
  readonly loadingOrders = signal(false);

  readonly orderFilter = signal<{ status: 'All' | OrderStatus; search: string }>({ status: 'All', search: '' });

  readonly productForm = signal<ProductForm>(this.emptyProductForm());
  readonly categoryForm = signal<CategoryForm>(this.emptyCategoryForm());

  // ─── Derived chart data ────────────────────────────────────────────────────
  readonly revenueSeries = computed<LinePoint[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return s.revenueSeries.map(p => ({
      label: this.shortDate(p.date),
      value: p.revenue,
    }));
  });

  readonly orderSeries = computed<LinePoint[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return s.revenueSeries.map(p => ({
      label: this.shortDate(p.date),
      value: p.orders,
    }));
  });

  readonly statusDonut = computed<DonutSlice[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return ORDER_STATUSES.map(st => ({
      label: st,
      value: s.orderStatusCounts[st] || 0,
      color: STATUS_COLORS[st],
    }));
  });

  readonly paymentDonut = computed<DonutSlice[]>(() => {
    const s = this.stats();
    if (!s) return [];
    const palette: Record<string, string> = {
      Paid: '#c9a961',
      Pending: '#d4a548',
      AwaitingProvider: '#7fa1d4',
      Failed: '#c97070',
      Refunded: '#9b87d4',
    };
    return Object.entries(s.paymentStatusCounts).map(([label, value]) => ({
      label,
      value,
      color: palette[label] ?? '#888',
    }));
  });

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private adminService: AdminService,
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  setTab(t: Tab): void {
    this.tab.set(t);
    this.status.set(null);

    if (t === 'orders' && this.orders().length === 0) this.loadOrders();
    if (t === 'users' && this.users().length === 0) this.loadUsers();
    if (t === 'overview') this.loadStats();
  }

  refreshAll(): void {
    this.loadStats();
    this.productService.list().subscribe({
      next: items => this.products.set(items),
      error: () => this.flash('err', 'Failed to load products.'),
    });
    this.categoryService.list().subscribe({
      next: cats => this.categories.set(cats),
      error: () => this.flash('err', 'Failed to load categories.'),
    });
  }

  loadStats(): void {
    this.loadingStats.set(true);
    this.adminService.dashboard().subscribe({
      next: s => { this.stats.set(s); this.loadingStats.set(false); },
      error: () => { this.loadingStats.set(false); this.flash('err', 'Failed to load dashboard stats.'); },
    });
  }

  loadOrders(): void {
    this.loadingOrders.set(true);
    const f = this.orderFilter();
    this.adminService.orders({ status: f.status, search: f.search }).subscribe({
      next: list => { this.orders.set(list); this.loadingOrders.set(false); },
      error: () => { this.loadingOrders.set(false); this.flash('err', 'Failed to load orders.'); },
    });
  }

  loadUsers(): void {
    this.adminService.users().subscribe({
      next: list => this.users.set(list),
      error: () => this.flash('err', 'Failed to load users.'),
    });
  }

  resolveImage(url: string): string {
    return this.productService.resolveImageUrl(url);
  }

  // ─── Order management ──────────────────────────────────────────────────────
  setOrderStatusFilter(value: 'All' | OrderStatus): void {
    this.orderFilter.update(f => ({ ...f, status: value }));
    this.loadOrders();
  }

  setOrderSearch(value: string): void {
    this.orderFilter.update(f => ({ ...f, search: value }));
  }

  applyOrderSearch(): void {
    this.loadOrders();
  }

  changeOrderStatus(order: AdminOrder, newStatus: OrderStatus): void {
    if (order.status === newStatus) return;
    const previous = order.status;
    // Optimistic update
    this.orders.update(list => list.map(o => o.id === order.id ? { ...o, status: newStatus } : o));

    this.adminService.updateStatus(order.id, newStatus).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === order.id ? updated : o));
        this.flash('ok', `Order #${order.id} marked ${newStatus}.`);
        this.loadStats(); // KPIs may have shifted
      },
      error: err => {
        this.orders.update(list => list.map(o => o.id === order.id ? { ...o, status: previous } : o));
        this.flash('err', err?.error?.message ?? 'Could not update order status.');
      },
    });
  }

  // ─── Product form ──────────────────────────────────────────────────────────
  editProduct(p: Product): void {
    this.productForm.set({
      id: p.id, name: p.name, description: p.description, price: p.price, stock: p.stock,
      imageUrl: p.imageUrl, weight: p.weight, material: p.material, purity: p.purity,
      badge: p.badge, featuresText: (p.features ?? []).join(', '),
      isFeatured: p.isFeatured, categoryId: p.categoryId,
    });
    this.tab.set('products');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetProductForm(): void { this.productForm.set(this.emptyProductForm()); }

  saveProduct(): void {
    const f = this.productForm();
    if (!f.name || f.categoryId == null) {
      this.flash('err', 'Name and category are required.');
      return;
    }
    const payload: CreateProductInput = {
      name: f.name, description: f.description,
      price: Number(f.price) || 0, stock: Number(f.stock) || 0,
      imageUrl: f.imageUrl, weight: Number(f.weight) || 0,
      material: f.material, purity: f.purity, badge: f.badge,
      features: f.featuresText.split(',').map(s => s.trim()).filter(s => s.length > 0),
      isFeatured: f.isFeatured, categoryId: f.categoryId,
    };

    const obs = f.id ? this.productService.update(f.id, payload) : this.productService.create(payload);
    obs.subscribe({
      next: () => {
        this.flash('ok', f.id ? 'Product updated.' : 'Product created.');
        this.resetProductForm();
        this.refreshAll();
      },
      error: err => this.flash('err', err?.error?.message ?? 'Save failed.'),
    });
  }

  deleteProduct(p: Product): void {
    if (typeof window !== 'undefined' && !window.confirm(`Delete "${p.name}"?`)) return;
    this.productService.delete(p.id).subscribe({
      next: () => { this.flash('ok', 'Product deleted.'); this.refreshAll(); },
      error: err => this.flash('err', err?.error?.message ?? 'Delete failed.'),
    });
  }

  onImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.productService.uploadImage(file).subscribe({
      next: res => {
        this.uploading.set(false);
        this.productForm.update(f => ({ ...f, imageUrl: res.imageUrl }));
        this.flash('ok', 'Image uploaded.');
        input.value = '';
      },
      error: err => {
        this.uploading.set(false);
        this.flash('err', err?.error?.message ?? 'Upload failed.');
        input.value = '';
      },
    });
  }

  updateProductForm<K extends keyof ProductForm>(key: K, value: ProductForm[K]): void {
    this.productForm.update(f => ({ ...f, [key]: value }));
  }

  // ─── Category form ─────────────────────────────────────────────────────────
  editCategory(c: Category): void {
    this.categoryForm.set({ id: c.id, name: c.name, imageUrl: c.imageUrl, description: c.description });
    this.tab.set('categories');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetCategoryForm(): void { this.categoryForm.set(this.emptyCategoryForm()); }

  saveCategory(): void {
    const f = this.categoryForm();
    if (!f.name) { this.flash('err', 'Category name is required.'); return; }
    const payload: CreateCategoryInput = {
      name: f.name, imageUrl: f.imageUrl, description: f.description,
    };
    const obs = f.id ? this.categoryService.update(f.id, payload) : this.categoryService.create(payload);
    obs.subscribe({
      next: () => {
        this.flash('ok', f.id ? 'Category updated.' : 'Category created.');
        this.resetCategoryForm();
        this.refreshAll();
      },
      error: err => this.flash('err', err?.error?.message ?? 'Save failed.'),
    });
  }

  deleteCategory(c: Category): void {
    if (typeof window !== 'undefined' && !window.confirm(`Delete category "${c.name}"?`)) return;
    this.categoryService.delete(c.id).subscribe({
      next: () => { this.flash('ok', 'Category deleted.'); this.refreshAll(); },
      error: err => this.flash('err', err?.error?.message ?? 'Delete failed.'),
    });
  }

  updateCategoryForm<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]): void {
    this.categoryForm.update(f => ({ ...f, [key]: value }));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  formatCurrency(v: number): string {
    return `Rs ${(v ?? 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  }

  private shortDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  private emptyProductForm(): ProductForm {
    return {
      id: null, name: '', description: '', price: 0, stock: 0, imageUrl: '',
      weight: 0, material: '', purity: '', badge: '', featuresText: '',
      isFeatured: false, categoryId: null,
    };
  }

  private emptyCategoryForm(): CategoryForm {
    return { id: null, name: '', imageUrl: '', description: '' };
  }

  private flash(kind: 'ok' | 'err', msg: string): void {
    this.status.set({ kind, msg });
    setTimeout(() => this.status.set(null), 3500);
  }
}
