import { Injectable } from '@angular/core';

export interface CartItem {
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private items: CartItem[] = [];
  private storageKey = 'luxury_cart';

  constructor() {
    // ✅ ONLY run in browser
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem(this.storageKey);
      if (savedCart) {
        this.items = JSON.parse(savedCart);
      }
    }
  }

  // ✅ safe save
  private saveCart() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }
  }

  getItems(): CartItem[] {
    return this.items;
  }

addToCart(product: Omit<CartItem, 'quantity'>) {
  const existing = this.items.find(
    i => i.name === product.name
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    this.items.push({
      ...product,
      quantity: 1
    });
  }

  this.saveCart();
}

removeItem(productName: string) {
  const existing = this.items.find(i => i.name === productName);

  if (!existing) return;

  if (existing.quantity > 1) {
    existing.quantity -= 1; // 🔥 decrease only 1
  } else {
    this.items = this.items.filter(i => i.name !== productName); // remove completely
  }

  this.saveCart();
}

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getTotalQuantity(): number {
    return this.items.reduce((t, i) => t + i.quantity, 0);
  }

  getTotalPrice(): number {
    return this.items.reduce((t, i) => t + i.price * i.quantity, 0);
  }
  getCount() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
}
}