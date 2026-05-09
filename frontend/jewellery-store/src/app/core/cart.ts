import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: number;     // server-side id; required to actually place an order
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

const STORAGE_KEY = 'aurum_cart';
// Old keys we used to write to. Migrated/cleared on construct so a stale
// cart from a prior version doesn't resurrect across sessions.
const LEGACY_KEYS = ['luxury_cart', 'cart'];

@Injectable({ providedIn: 'root' })
export class CartService {

  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((t, i) => t + i.quantity, 0));
  readonly total = computed(() => this._items().reduce((t, i) => t + i.price * i.quantity, 0));

  constructor() {
    if (typeof window === 'undefined' || !window.localStorage) return;

    let initial: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) initial = JSON.parse(raw);
    } catch { /* corrupted JSON — start fresh */ }

    // One-shot migration: pull whatever was in the legacy key if the current
    // key is empty, then drop the legacy entries so we don't keep merging.
    if (initial.length === 0) {
      for (const legacy of LEGACY_KEYS) {
        try {
          const raw = localStorage.getItem(legacy);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<CartItem>[];
            initial = parsed
              .filter((p): p is CartItem => !!p && typeof p.productId === 'number' && typeof p.quantity === 'number')
              .map(p => ({
                productId: p.productId!,
                name: p.name ?? '',
                price: p.price ?? 0,
                image: p.image,
                quantity: p.quantity!,
              }));
            if (initial.length > 0) break;
          }
        } catch { /* ignore */ }
      }
    }
    for (const legacy of LEGACY_KEYS) localStorage.removeItem(legacy);

    this._items.set(initial);
    this.persist();
  }

  // ─── Read API (kept compatible with existing callers) ─────────────────
  getItems(): CartItem[] { return this._items(); }
  getTotalQuantity(): number { return this.count(); }
  getTotalPrice(): number { return this.total(); }
  getCount(): number { return this.count(); }

  // ─── Mutations — keyed strictly by productId ──────────────────────────
  addToCart(product: Omit<CartItem, 'quantity'>): void {
    if (product.productId == null) {
      throw new Error('addToCart: productId is required');
    }
    this._items.update(list => {
      const idx = list.findIndex(i => i.productId === product.productId);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...list, { ...product, quantity: 1 }];
    });
    this.persist();
  }

  /** Decrement by one; remove the line when quantity hits zero. */
  decrement(productId: number): void {
    this._items.update(list => {
      const idx = list.findIndex(i => i.productId === productId);
      if (idx < 0) return list;
      const item = list[idx];
      if (item.quantity <= 1) return list.filter((_, i) => i !== idx);
      const next = [...list];
      next[idx] = { ...item, quantity: item.quantity - 1 };
      return next;
    });
    this.persist();
  }

  /** Add another unit of an item already in the cart. */
  increment(productId: number): void {
    this._items.update(list => {
      const idx = list.findIndex(i => i.productId === productId);
      if (idx < 0) return list;
      const next = [...list];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      return next;
    });
    this.persist();
  }

  /** Remove the entire line (all units of a product) regardless of quantity. */
  removeAll(productId: number): void {
    this._items.update(list => list.filter(i => i.productId !== productId));
    this.persist();
  }

  clearCart(): void {
    this._items.set([]);
    this.persist();
  }

  private persist(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
  }
}
