import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
    private _items = new BehaviorSubject<CartItem[]>(this.loadCart());

    items$ = this._items.asObservable();

    get items(): CartItem[] {
        return this._items.value;
    }

    get totalItems(): number {
        return this._items.value.reduce((sum, i) => sum + i.quantity, 0);
    }

    get totalPrice(): number {
        return this._items.value.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    }

    addToCart(product: Product, quantity = 1): void {
        const current = this._items.value;
        const existing = current.find(i => i.product.id === product.id);
        if (existing) {
            existing.quantity += quantity;
            this._items.next([...current]);
        } else {
            this._items.next([...current, { product, quantity }]);
        }
        this.saveCart();
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }
        const updated = this._items.value.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
        );
        this._items.next(updated);
        this.saveCart();
    }

    removeItem(productId: number): void {
        this._items.next(this._items.value.filter(i => i.product.id !== productId));
        this.saveCart();
    }

    clearCart(): void {
        this._items.next([]);
        localStorage.removeItem('cart');
    }

    private saveCart(): void {
        localStorage.setItem('cart', JSON.stringify(this._items.value));
    }

    private loadCart(): CartItem[] {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : [];
    }
}
